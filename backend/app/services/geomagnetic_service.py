"""
Provides the *reference* Earth magnetic field (from a geomagnetic model,
e.g. World Magnetic Model / IGRF) for a given lat/lon/alt/date, plus
real-time space-weather indices (Kp, Dst) that modulate the field.

Two modes:
  1. If `ppigrf` / `pyIGRF` is installed -> compute true IGRF/WMM field.
  2. Otherwise -> fall back to a simple analytic dipole approximation so
     the pipeline still runs end-to-end without extra dependencies.

Real-time space weather is pulled from NOAA SWPC public JSON endpoints:
  - Kp index:  https://services.swpc.noaa.gov/json/planetary_k_index_1m.json
  - Dst-like / solar wind: https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json
(These require outbound internet access from the backend host.)
"""
from __future__ import annotations
import math
import datetime as dt
import requests

NOAA_KP_URL = "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json"
NOAA_DST_URL = "https://services.swpc.noaa.gov/products/kyoto-dst.json"


def _dipole_field_nT(lat_deg: float, lon_deg: float, alt_m: float):
    """
    Very simple centered-dipole approximation of Earth's field, used only
    as an offline fallback. B0 ~ 31200 nT (equatorial surface reference).
    """
    B0 = 31200.0
    Re = 6371000.0
    r = Re + alt_m
    lat = math.radians(lat_deg)

    B_r = -2 * B0 * (Re / r) ** 3 * math.sin(lat)      # radial (down-ish)
    B_theta = -B0 * (Re / r) ** 3 * math.cos(lat)       # north-south component

    B_north = -B_theta
    B_down = -B_r
    B_east = 0.0  # symmetric dipole has no east component
    return B_north, B_east, B_down


def get_reference_field(lat_deg: float, lon_deg: float, alt_m: float,
                         when: dt.datetime = None):
    """
    Returns dict with B_north_nT, B_east_nT, B_down_nT, B_total_nT,
    declination_deg, inclination_deg.
    Tries pyIGRF first; falls back to dipole model.
    """
    when = when or dt.datetime.utcnow()
    try:
        import pyIGRF  # pip install pyIGRF
        year = when.year + (when.timetuple().tm_yday / 365.25)
        # pyIGRF's bundled coefficient set only covers up to 2025; clamp so
        # we still get the latest valid model instead of a silent zero-field
        # return. Replace with an updated coefficient file when available.
        year_clamped = min(year, 2025.0)
        alt_km = alt_m / 1000.0
        D, I, H, X, Y, Z, F = pyIGRF.igrf_value(lat_deg, lon_deg, alt_km, year_clamped)
        if F == 0.0:
            raise ValueError("pyIGRF returned degenerate zero field")
        return {
            "B_north_nT": X,
            "B_east_nT": Y,
            "B_down_nT": Z,
            "B_total_nT": F,
            "declination_deg": D,
            "inclination_deg": I,
            "source": "IGRF",
        }
    except Exception:
        B_north, B_east, B_down = _dipole_field_nT(lat_deg, lon_deg, alt_m)
        B_total = math.sqrt(B_north ** 2 + B_east ** 2 + B_down ** 2)
        inclination = math.degrees(math.atan2(B_down, math.sqrt(B_north ** 2 + B_east ** 2)))
        declination = math.degrees(math.atan2(B_east, B_north))
        return {
            "B_north_nT": B_north,
            "B_east_nT": B_east,
            "B_down_nT": B_down,
            "B_total_nT": B_total,
            "declination_deg": declination,
            "inclination_deg": inclination,
            "source": "dipole_fallback",
        }


def get_space_weather(timeout_s: float = 5.0):
    """
    Fetch current Kp index (and Dst if available) from NOAA SWPC.
    Returns dict with kp_index, dst_index_nT (dst may be None if unavailable).
    Falls back to quiet-time defaults (Kp=2, Dst=-5) on any network failure.
    """
    kp_index = 2.0
    dst_index = -5.0
    try:
        resp = requests.get(NOAA_KP_URL, timeout=timeout_s)
        resp.raise_for_status()
        data = resp.json()
        if len(data) > 1:
            latest = data[-1]
            kp_index = float(latest.get("kp_index", kp_index))
    except Exception:
        pass

    try:
        resp = requests.get(NOAA_DST_URL, timeout=timeout_s)
        resp.raise_for_status()
        data = resp.json()
        if isinstance(data, list) and len(data) > 1:
            dst_index = float(data[-1][1])
    except Exception:
        pass

    return {"kp_index": kp_index, "dst_index_nT": dst_index}

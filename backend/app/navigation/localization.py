"""
Basic magnetic map-matching localization (Inverse problem 2, simplified).
Given a measured B vector and a reference field at the *assumed true*
location, this module demonstrates the residual-minimization concept.
A full deployment needs a dense magnetic anomaly map; here we provide the
scaffolding (cost function + optimizer) using the IGRF/dipole reference
as a stand-in "map" you can later replace with a real anomaly grid.
"""
import numpy as np
from scipy.optimize import minimize
from app.services.geomagnetic_service import get_reference_field


def _cost(pos, B_measured_uT, alt_m, when):
    lat, lon = pos
    ref = get_reference_field(lat, lon, alt_m, when)
    B_map_uT = np.array([ref["B_north_nT"], ref["B_east_nT"], ref["B_down_nT"]]) / 1000.0
    return float(np.linalg.norm(np.array(B_measured_uT) - B_map_uT) ** 2)


def estimate_position(B_measured_uT, initial_guess_latlon, alt_m, when):
    """
    Nonlinear least squares map-matching: finds (lat, lon) minimizing
    || B_measured - B_map(lat,lon) ||^2.  Requires a good initial guess
    (e.g. last known GPS fix) since the field is not globally injective.
    """
    res = minimize(
        _cost, x0=np.array(initial_guess_latlon),
        args=(B_measured_uT, alt_m, when),
        method="Nelder-Mead",
        options={"xatol": 1e-6, "fatol": 1e-6, "maxiter": 500},
    )
    lat_est, lon_est = res.x
    residual = float(np.sqrt(res.fun))
    return {
        "latitude": lat_est,
        "longitude": lon_est,
        "altitude_m": alt_m,
        "residual_field_uT": residual,
        "converged": bool(res.success),
    }

"""
Simulates ODMR spectra for a given NV axis + magnetic field (using the
real Hamiltonian), adds noise, then fits Lorentzian dips to recover
f-, f+, linewidth and contrast (this mirrors what Module A + B would do
with a real experimental spectrum too).
"""
import numpy as np
from scipy.optimize import curve_fit

from app.physics.hamiltonian import build_hamiltonian, to_local_frame
from app.physics.eigenvalues import solve_transitions
from app.physics.constants import (
    DEFAULT_LINEWIDTH_MHZ, DEFAULT_CONTRAST_PCT,
    DEFAULT_MW_SWEEP_START_GHZ, DEFAULT_MW_SWEEP_STOP_GHZ,
    DEFAULT_MW_SWEEP_POINTS, GHZ_TO_HZ
)


def true_transition_frequencies(B_lab_T, nv_axis, D_ghz, E_ghz, gamma_ghz_per_T):
    """Compute exact f-, f+ for one NV axis via Hamiltonian diagonalization."""
    B_local = to_local_frame(np.array(B_lab_T), np.array(nv_axis))
    H = build_hamiltonian(D_ghz, E_ghz, B_local, gamma_ghz_per_T)
    f_minus, f_plus, _ = solve_transitions(H)
    return f_minus, f_plus


def _double_lorentzian(f, I0, A1, f1, gamma1, A2, f2, gamma2):
    return (I0
            - A1 / (1 + ((f - f1) / gamma1) ** 2)
            - A2 / (1 + ((f - f2) / gamma2) ** 2))


def simulate_odmr_spectrum(f_minus_ghz, f_plus_ghz,
                            linewidth_mhz=DEFAULT_LINEWIDTH_MHZ,
                            contrast_pct=DEFAULT_CONTRAST_PCT,
                            n_points=DEFAULT_MW_SWEEP_POINTS,
                            f_start=DEFAULT_MW_SWEEP_START_GHZ,
                            f_stop=DEFAULT_MW_SWEEP_STOP_GHZ,
                            noise_std=0.002,
                            rng=None):
    """Generate a synthetic ODMR spectrum (fluorescence vs frequency)."""
    rng = rng or np.random.default_rng()
    freqs = np.linspace(f_start, f_stop, n_points)
    gamma_ghz = linewidth_mhz / 1000.0
    A = contrast_pct / 100.0
    I0 = 1.0

    signal = _double_lorentzian(freqs, I0, A, f_minus_ghz, gamma_ghz, A, f_plus_ghz, gamma_ghz)
    noisy = signal + rng.normal(0, noise_std, size=freqs.shape)
    return freqs, noisy


def fit_odmr_spectrum(freqs, intensities):
    """
    Fit a double-Lorentzian to recover f-, f+, linewidth, contrast.
    Initial guesses come from the two lowest-intensity points.
    """
    idx_sorted = np.argsort(intensities)
    # pick two lowest points that are reasonably separated in frequency
    f1_guess = freqs[idx_sorted[0]]
    f2_guess = f1_guess
    for idx in idx_sorted[1:]:
        if abs(freqs[idx] - f1_guess) > 0.01:  # >10 MHz apart
            f2_guess = freqs[idx]
            break
    f_minus_guess, f_plus_guess = sorted([f1_guess, f2_guess])

    p0 = [1.0, 0.15, f_minus_guess, 0.006, 0.15, f_plus_guess, 0.006]
    bounds = (
        [0.5, 0.0, freqs.min(), 0.001, 0.0, freqs.min(), 0.001],
        [1.5, 1.0, freqs.max(), 0.05, 1.0, freqs.max(), 0.05],
    )
    try:
        popt, pcov = curve_fit(_double_lorentzian, freqs, intensities, p0=p0,
                                bounds=bounds, maxfev=20000)
        I0, A1, f1, g1, A2, f2, g2 = popt
        f_minus, f_plus = sorted([f1, f2])
        linewidth_mhz = ((g1 + g2) / 2) * 1000.0
        contrast_pct = ((A1 + A2) / 2) * 100.0
        perr = np.sqrt(np.diag(pcov))
        sigma_f_mhz = float(np.mean([perr[2], perr[5]])) * 1000.0
        return {
            "f_minus_ghz": f_minus,
            "f_plus_ghz": f_plus,
            "linewidth_mhz": linewidth_mhz,
            "contrast_pct": contrast_pct,
            "sigma_f_mhz": sigma_f_mhz,
            "fit_success": True,
        }
    except Exception as e:
        return {
            "f_minus_ghz": f_minus_guess,
            "f_plus_ghz": f_plus_guess,
            "linewidth_mhz": DEFAULT_LINEWIDTH_MHZ,
            "contrast_pct": DEFAULT_CONTRAST_PCT,
            "sigma_f_mhz": 1.0,
            "fit_success": False,
            "error": str(e),
        }

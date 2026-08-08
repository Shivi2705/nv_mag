"""
Orchestrates a single measurement sample:
  true B (lab frame, uT) -> for each of 4 NV axes: exact f-,f+ -> simulate
  ODMR -> fit ODMR -> recover f-,f+ -> projections -> vector reconstruction
"""
import numpy as np
from app.physics.nv_axes import get_nv_axes
from app.physics.constants import UT_TO_T, DEFAULT_E_GHZ, GAMMA_NV_GHZ_PER_T, D_GS_GHZ
from app.services.odmr_service import (
    true_transition_frequencies, simulate_odmr_spectrum, fit_odmr_spectrum
)
from app.processing.vector_reconstruction import projections_from_splittings, reconstruct_vector


def run_full_sample(B_true_uT, D_ghz=D_GS_GHZ, E_ghz=DEFAULT_E_GHZ,
                     gamma_ghz_per_T=GAMMA_NV_GHZ_PER_T, rng=None):
    """
    B_true_uT: [Bx, By, Bz] in microtesla (lab/earth frame), the field that
               is 'actually there' for this simulated sample.
    Returns dict: nv_odmr (per-axis fit results) + vector_result.
    """
    rng = rng or np.random.default_rng()
    B_true_T = np.array(B_true_uT) * UT_TO_T
    axes = get_nv_axes()

    nv_odmr = {}
    f_minus_list, f_plus_list = [], []

    for i, axis in enumerate(axes, start=1):
        f_minus_true, f_plus_true = true_transition_frequencies(
            B_true_T, axis, D_ghz, E_ghz, gamma_ghz_per_T
        )
        freqs, intensities = simulate_odmr_spectrum(f_minus_true, f_plus_true, rng=rng)
        fit = fit_odmr_spectrum(freqs, intensities)

        nv_odmr[f"NV{i}"] = fit
        f_minus_list.append(fit["f_minus_ghz"])
        f_plus_list.append(fit["f_plus_ghz"])

    b_T = projections_from_splittings(f_minus_list, f_plus_list, gamma_ghz_per_T)
    vector_result = reconstruct_vector(b_T)

    return {"nv_odmr": nv_odmr, "vector_result": vector_result}

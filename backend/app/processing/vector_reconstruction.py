"""
Core scalar-projection -> vector reconstruction (Module C).
b = N @ B   =>   B_hat = pinv(N) @ b
"""
import numpy as np
from app.physics.nv_axes import get_nv_axes, projection_matrix
from app.physics.constants import GAMMA_NV_GHZ_PER_T, UT_TO_T, T_TO_UT


def projections_from_splittings(f_minus_list, f_plus_list, gamma_ghz_per_T=GAMMA_NV_GHZ_PER_T):
    """
    f_minus_list, f_plus_list: length-4 arrays (GHz) for NV1..NV4.
    Returns b (length-4 array) of B_parallel in Tesla.
    B_par = (f_plus - f_minus) / (2*gamma)
    """
    f_minus = np.asarray(f_minus_list, dtype=float)
    f_plus = np.asarray(f_plus_list, dtype=float)
    delta_f = f_plus - f_minus  # GHz
    B_par_T = delta_f / (2 * gamma_ghz_per_T)  # (GHz)/(GHz/T) = T
    return B_par_T


def reconstruct_vector(b_T: np.ndarray, calibration_matrix: np.ndarray = None):
    """
    b_T: length-4 array of B_parallel (Tesla) for NV1..NV4.
    Returns dict with Bx, By, Bz (uT), |B| (uT), theta_deg, phi_deg, and
    the projection matrix used.
    """
    axes = get_nv_axes(calibration_matrix)
    N = projection_matrix(axes)  # 4x3

    B_hat_T, residuals, rank, sv = np.linalg.lstsq(N, b_T, rcond=None)
    B_hat_uT = B_hat_T * T_TO_UT

    Bx, By, Bz = B_hat_uT
    B_total = float(np.linalg.norm(B_hat_uT))
    theta_deg = float(np.degrees(np.arccos(Bz / B_total))) if B_total > 0 else 0.0
    phi_deg = float(np.degrees(np.arctan2(By, Bx)))

    return {
        "Bx_uT": float(Bx),
        "By_uT": float(By),
        "Bz_uT": float(Bz),
        "B_total_uT": B_total,
        "theta_deg": theta_deg,
        "phi_deg": phi_deg,
        "N_matrix": N.tolist(),
    }


def propagate_uncertainty(sigma_b_T: np.ndarray, calibration_matrix: np.ndarray = None):
    """
    sigma_b_T: length-4 std-dev of B_parallel measurements (Tesla).
    Returns 3x3 covariance matrix of [Bx,By,Bz] (uT^2), via
    Sigma_B = N+ Sigma_b (N+)^T
    """
    axes = get_nv_axes(calibration_matrix)
    N = projection_matrix(axes)
    N_pinv = np.linalg.pinv(N)
    Sigma_b = np.diag(np.asarray(sigma_b_T) ** 2)
    Sigma_B_T2 = N_pinv @ Sigma_b @ N_pinv.T
    Sigma_B_uT2 = Sigma_B_T2 * (T_TO_UT ** 2)
    return Sigma_B_uT2

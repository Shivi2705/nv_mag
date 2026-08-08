"""
NV ground-state spin Hamiltonian:
H = D*Sz^2 + E*(Sx^2 - Sy^2) + gamma_NV * (Bx*Sx + By*Sy + Bz*Sz)

B is expressed in the NV's own local axis frame (z along NV axis) in Tesla.
D, E in GHz -> Hamiltonian returned in GHz (so eigenvalues are directly frequencies).
"""
import numpy as np
from app.physics.spin_matrices import Sx, Sy, Sz, Sx2, Sy2, Sz2
from app.physics.constants import GAMMA_NV_GHZ_PER_T


def build_hamiltonian(D_ghz: float, E_ghz: float, B_local_T: np.ndarray,
                       gamma_ghz_per_T: float = GAMMA_NV_GHZ_PER_T) -> np.ndarray:
    """
    B_local_T: [Bx, By, Bz] in Tesla, expressed in the NV axis frame (z = NV axis).
    Returns 3x3 Hermitian Hamiltonian matrix (units: GHz).
    """
    Bx, By, Bz = B_local_T
    H = (D_ghz * Sz2
         + E_ghz * (Sx2 - Sy2)
         + gamma_ghz_per_T * (Bx * Sx + By * Sy + Bz * Sz))
    return H


def to_local_frame(B_lab_T: np.ndarray, nv_axis: np.ndarray) -> np.ndarray:
    """
    Rotate a lab-frame field vector into the local NV frame where z is
    along nv_axis. Builds an orthonormal basis {x', y', z'=nv_axis}.
    """
    z_local = nv_axis / np.linalg.norm(nv_axis)
    helper = np.array([1.0, 0.0, 0.0]) if abs(z_local[0]) < 0.9 else np.array([0.0, 1.0, 0.0])
    x_local = np.cross(helper, z_local)
    x_local /= np.linalg.norm(x_local)
    y_local = np.cross(z_local, x_local)

    R = np.vstack([x_local, y_local, z_local])  # rows = local basis vectors in lab coords
    return R @ B_lab_T

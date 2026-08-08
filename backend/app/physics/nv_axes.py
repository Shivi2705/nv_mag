"""
Defines the 4 NV crystallographic <111> axes in the diamond frame,
and builds the projection matrix N used for vector reconstruction.
"""
import numpy as np

# Ideal 4 NV orientations along <111> directions (unit vectors), diamond frame
NV_AXES_IDEAL = (1 / np.sqrt(3)) * np.array([
    [1,  1,  1],
    [1, -1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
], dtype=float)  # shape (4,3)


def get_nv_axes(calibration_matrix: np.ndarray = None) -> np.ndarray:
    """
    Return the 4x3 NV axis matrix N.
    If a calibration_matrix (3x3 rotation/misalignment) is supplied,
    axes are rotated: n_i' = R @ n_i
    """
    axes = NV_AXES_IDEAL.copy()
    if calibration_matrix is not None:
        axes = (calibration_matrix @ axes.T).T
        # re-normalize each row to unit length
        norms = np.linalg.norm(axes, axis=1, keepdims=True)
        axes = axes / norms
    return axes


def projection_matrix(axes: np.ndarray = None) -> np.ndarray:
    """Return the 4x3 matrix N such that b = N @ B."""
    if axes is None:
        axes = NV_AXES_IDEAL
    return axes


def rotation_matrix_from_euler(roll, pitch, yaw):
    """
    Build a rotation matrix (diamond/sensor frame -> earth/NED frame)
    from roll (x), pitch (y), yaw (z) in radians.
    """
    cr, sr = np.cos(roll), np.sin(roll)
    cp, sp = np.cos(pitch), np.sin(pitch)
    cy, sy = np.cos(yaw), np.sin(yaw)

    Rx = np.array([[1, 0, 0], [0, cr, -sr], [0, sr, cr]])
    Ry = np.array([[cp, 0, sp], [0, 1, 0], [-sp, 0, cp]])
    Rz = np.array([[cy, -sy, 0], [sy, cy, 0], [0, 0, 1]])

    return Rz @ Ry @ Rx

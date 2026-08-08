"""
Spin-1 operator matrices (Sx, Sy, Sz, Sz^2 etc.) in the {+1, 0, -1} basis
used to build the NV ground-state Hamiltonian.
"""
import numpy as np

# Basis order: |+1>, |0>, |-1>
Sz = np.array([
    [1, 0, 0],
    [0, 0, 0],
    [0, 0, -1]
], dtype=complex)

Sx = (1 / np.sqrt(2)) * np.array([
    [0, 1, 0],
    [1, 0, 1],
    [0, 1, 0]
], dtype=complex)

Sy = (1 / (np.sqrt(2) * 1j)) * np.array([
    [0, 1, 0],
    [-1, 0, 1],
    [0, -1, 0]
], dtype=complex)

Sz2 = Sz @ Sz
Sx2 = Sx @ Sx
Sy2 = Sy @ Sy

IDENTITY3 = np.eye(3, dtype=complex)


def spin_operators():
    """Return dict of spin-1 operators for convenience."""
    return {
        "Sx": Sx,
        "Sy": Sy,
        "Sz": Sz,
        "Sx2": Sx2,
        "Sy2": Sy2,
        "Sz2": Sz2,
        "I": IDENTITY3,
    }

"""
Diagonalize the NV Hamiltonian and extract the two ODMR transition
frequencies f- (0 -> -1) and f+ (0 -> +1).
"""
import numpy as np


def solve_transitions(H: np.ndarray):
    """
    H: 3x3 Hermitian Hamiltonian (GHz), basis order [+1, 0, -1].
    Returns (f_minus, f_plus, eigvals_sorted) all in GHz.
    f_minus = E(ms=0) - E(ms=-1)  [but we report as positive transition freq]
    f_plus  = E(ms=0) - E(ms=+1)
    In practice we sort eigenvalues and compute the two gaps from the
    lowest-energy (~ms=0-like) state to the other two.
    """
    eigvals = np.linalg.eigvalsh(H)
    eigvals_sorted = np.sort(eigvals)

    # The ms=0 state is generically the lowest at B=0; at finite field the
    # ordering can shift slightly, so we identify the state whose eigenvector
    # has the largest overlap with |0> instead for robustness.
    _, eigvecs = np.linalg.eigh(H)
    basis_zero = np.array([0, 1, 0], dtype=complex)  # |0> in [+1,0,-1] basis
    overlaps = np.abs(eigvecs.conj().T @ basis_zero) ** 2
    idx0 = int(np.argmax(overlaps))

    E0 = eigvals[idx0]
    others = [eigvals[i] for i in range(3) if i != idx0]
    others_sorted = sorted(others)

    f_minus = abs(others_sorted[0] - E0)
    f_plus = abs(others_sorted[1] - E0)

    return f_minus, f_plus, eigvals_sorted

"""
Physical constants for the NV-center vector magnetometry / navigation backend.
All frequencies in GHz, magnetic fields in Tesla unless noted (uT used at API boundary).
"""

# Zero-field splitting (ground state) at room temperature
D_GS_GHZ = 2.87000

# Temperature coefficient of D (GHz/K) - approx -74 kHz/K
D_TEMP_COEFF_GHZ_PER_K = -74e-6

# Reference temperature for D_GS_GHZ
D_REF_TEMP_K = 300.0

# Strain / local electric field splitting term (typical range 1-10 MHz), GHz
DEFAULT_E_GHZ = 0.0032

# NV electron gyromagnetic ratio (GHz/T)
GAMMA_NV_GHZ_PER_T = 28.024

# Electron spin S=1 -> dimension of Hilbert space
SPIN_DIM = 3

# Conversion factors
T_TO_UT = 1e6          # Tesla -> microtesla
UT_TO_T = 1e-6         # microtesla -> Tesla
GHZ_TO_HZ = 1e9

# Default ODMR simulation parameters
DEFAULT_LINEWIDTH_MHZ = 6.0
DEFAULT_CONTRAST_PCT = 18.0
DEFAULT_MW_SWEEP_START_GHZ = 2.75
DEFAULT_MW_SWEEP_STOP_GHZ = 2.99
DEFAULT_MW_SWEEP_POINTS = 401

# Default measurement noise
DEFAULT_SIGMA_F_MHZ = 0.35  # frequency-fit uncertainty per resonance

# Data collection defaults
DEFAULT_SESSION_DURATION_MIN = 60
DEFAULT_SAMPLE_INTERVAL_S = 60  # 1 sample/min -> 60 samples/hour (use 1s for dense data)

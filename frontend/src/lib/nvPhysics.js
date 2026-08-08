// Lightweight client-side mirror of the backend physics (constants.py,
// nv_axes.py, odmr_service.py) so pages can render live charts without
// waiting on a network round trip for every knob change. The backend
// remains the source of truth for anything persisted.

export const D_GS_GHZ = 2.87;
export const GAMMA_NV_GHZ_PER_T = 28.024;

export const NV_AXES = [
  { id: "NV1", vec: [1, 1, 1], color: "#00F0FF" },
  { id: "NV2", vec: [1, -1, -1], color: "#10B981" },
  { id: "NV3", vec: [-1, 1, -1], color: "#F59E0B" },
  { id: "NV4", vec: [-1, -1, 1], color: "#FB7185" },
].map((a) => {
  const n = Math.sqrt(3);
  return { ...a, vec: a.vec.map((c) => c / n) };
});

export function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function transitionFreqs(B_uT, axis, D = D_GS_GHZ, E = 0.0032, gamma = GAMMA_NV_GHZ_PER_T) {
  const B_T = B_uT.map((v) => v * 1e-6);
  const Bpar_T = dot(B_T, axis.vec);
  const zeeman = gamma * Bpar_T; // GHz
  const fMinus = D - E - zeeman;
  const fPlus = D + E + zeeman;
  return { fMinus, fPlus, Bpar_uT: Bpar_T * 1e6 };
}

function lorentzian(f, f0, gammaMHz, contrastPct) {
  const gammaGHz = gammaMHz / 1000;
  const halfw = gammaGHz / 2;
  return (contrastPct / 100) * (halfw * halfw) / ((f - f0) * (f - f0) + halfw * halfw);
}

export function odmrSpectrum(fMinus, fPlus, { linewidthMHz = 6, contrastPct = 18, points = 250, fStart = 2.75, fStop = 2.99 } = {}) {
  const rows = [];
  for (let i = 0; i < points; i++) {
    const f = fStart + ((fStop - fStart) * i) / (points - 1);
    const dip = 1 - lorentzian(f, fMinus, linewidthMHz, contrastPct) - lorentzian(f, fPlus, linewidthMHz, contrastPct);
    rows.push({ f: Number(f.toFixed(5)), pl: Number(dip.toFixed(5)) });
  }
  return rows;
}

// b = N @ B  ->  reconstruct via least squares (N is 4x3, fixed <111> axes)
export function reconstructVector(bPar_uT) {
  const N = NV_AXES.map((a) => a.vec); // 4x3
  // Normal equations: (N^T N) x = N^T b  (3x3 solve)
  const NT_N = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const NT_b = [0, 0, 0];
  for (let i = 0; i < 4; i++) {
    for (let r = 0; r < 3; r++) {
      NT_b[r] += N[i][r] * bPar_uT[i];
      for (let c = 0; c < 3; c++) {
        NT_N[r][c] += N[i][r] * N[i][c];
      }
    }
  }
  // solve 3x3 via Cramer's rule
  const det3 = (m) =>
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const D = det3(NT_N);
  const replaceCol = (m, col, vec) =>
    m.map((row, r) => row.map((v, c) => (c === col ? vec[r] : v)));
  const Bx = det3(replaceCol(NT_N, 0, NT_b)) / D;
  const By = det3(replaceCol(NT_N, 1, NT_b)) / D;
  const Bz = det3(replaceCol(NT_N, 2, NT_b)) / D;
  const total = Math.sqrt(Bx * Bx + By * By + Bz * Bz);
  const theta = total > 0 ? (Math.acos(Bz / total) * 180) / Math.PI : 0;
  const phi = (Math.atan2(By, Bx) * 180) / Math.PI;
  return { Bx, By, Bz, total, theta, phi };
}

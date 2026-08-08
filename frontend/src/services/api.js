import axios from "axios";

export const BASE_URL = "http://localhost:8000";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 600000, // physics simulation of 3600 samples can take ~2 min
});

export async function checkHealth() {
  const res = await client.get("/");
  return res.data;
}

export async function collectSession(payload) {
  // payload: { session_name, latitude, longitude, altitude_m, start_time?,
  //            duration_min, sample_interval_s, true_Bx_uT?, true_By_uT?, true_Bz_uT? }
  const res = await client.post("/api/data/collect", payload);
  return res.data;
}

export async function getSession(sessionId) {
  const res = await client.get(`/api/data/sessions/${sessionId}`);
  return res.data;
}

// The following are anticipated endpoints per the full spec (simulation,
// magnetometry, navigation). They degrade gracefully to null if the
// backend hasn't implemented them yet, so the UI never hard-crashes.
export async function simulateOdmr(payload) {
  try {
    const res = await client.post("/api/simulation/odmr", payload);
    return res.data;
  } catch (e) {
    return null;
  }
}

export async function reconstructVector(payload) {
  try {
    const res = await client.post("/api/magnetometry/reconstruct", payload);
    return res.data;
  } catch (e) {
    return null;
  }
}

export async function getNavigationTrack(sessionId) {
  try {
    const res = await client.get(`/api/navigation/track/${sessionId}`);
    return res.data;
  } catch (e) {
    return null;
  }
}

export default client;

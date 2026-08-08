"""
/api/data endpoints: start a collection session for a chosen place & time
window, generate one sample per interval, persist to DB and export CSV
into datasets/raw/.
"""
import os
import csv
import datetime as dt
import numpy as np
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession

from app.database.database import get_db
from app.database.models import Session as SessionModel, Sample as SampleModel
from app.models.request_models import CollectionRequest
from app.services.geomagnetic_service import get_reference_field, get_space_weather
from app.services.nv_service import run_full_sample
from app.physics.constants import D_GS_GHZ, DEFAULT_E_GHZ, GAMMA_NV_GHZ_PER_T

router = APIRouter(prefix="/api/data", tags=["data"])

DATASET_RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "datasets", "raw")
os.makedirs(DATASET_RAW_DIR, exist_ok=True)


@router.post("/collect")
def collect_session(req: CollectionRequest, db: DBSession = Depends(get_db)):
    start_time = req.start_time or dt.datetime.utcnow()
    end_time = start_time + dt.timedelta(minutes=req.duration_min)
    n_samples = max(1, (req.duration_min * 60) // req.sample_interval_s)

    session_row = SessionModel(
        name=req.session_name,
        latitude=req.latitude,
        longitude=req.longitude,
        altitude_m=req.altitude_m,
        start_time=start_time,
        end_time=end_time,
        sample_interval_s=req.sample_interval_s,
    )
    db.add(session_row)
    db.commit()
    db.refresh(session_row)

    # Reference field once per session (could re-fetch per sample if desired)
    ref = get_reference_field(req.latitude, req.longitude, req.altitude_m, start_time)
    sw = get_space_weather()

    if req.true_Bx_uT is not None:
        B_true_uT = [req.true_Bx_uT, req.true_By_uT, req.true_Bz_uT]
    else:
        B_true_uT = [ref["B_north_nT"] / 1000.0,
                     ref["B_east_nT"] / 1000.0,
                     ref["B_down_nT"] / 1000.0]

    rng = np.random.default_rng(42)
    csv_rows = []

    for k in range(n_samples):
        ts = start_time + dt.timedelta(seconds=k * req.sample_interval_s)

        # small realistic diurnal + noise wander of the true field
        wander = rng.normal(0, 0.05, size=3)  # uT
        B_sample_uT = np.array(B_true_uT) + wander

        result = run_full_sample(B_sample_uT, D_ghz=D_GS_GHZ, E_ghz=DEFAULT_E_GHZ,
                                  gamma_ghz_per_T=GAMMA_NV_GHZ_PER_T, rng=rng)

        sample_row = SampleModel(
            session_id=session_row.id,
            timestamp=ts,
            temperature_K=300.0 + rng.normal(0, 0.2),
            kp_index=sw["kp_index"],
            dst_index_nT=sw["dst_index_nT"],
            B_map_north_nT=ref["B_north_nT"],
            B_map_east_nT=ref["B_east_nT"],
            B_map_down_nT=ref["B_down_nT"],
            B_map_total_nT=ref["B_total_nT"],
            declination_deg=ref["declination_deg"],
            inclination_deg=ref["inclination_deg"],
            D_GHz=D_GS_GHZ,
            E_GHz=DEFAULT_E_GHZ,
            gamma_NV_GHz_per_T=GAMMA_NV_GHZ_PER_T,
            nv_odmr=result["nv_odmr"],
            vector_result=result["vector_result"],
            position_result=None,
        )
        db.add(sample_row)
        csv_rows.append({"timestamp": ts.isoformat(), **result["vector_result"]})

    db.commit()

    # Export CSV
    csv_path = os.path.join(DATASET_RAW_DIR, f"session_{session_row.id}.csv")
    if csv_rows:
        with open(csv_path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=list(csv_rows[0].keys()))
            writer.writeheader()
            writer.writerows(csv_rows)

    return {
        "session_id": session_row.id,
        "n_samples": n_samples,
        "csv_path": csv_path,
    }


@router.get("/sessions/{session_id}")
def get_session(session_id: int, db: DBSession = Depends(get_db)):
    session_row = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session_row:
        return {"error": "session not found"}
    samples = db.query(SampleModel).filter(SampleModel.session_id == session_id).all()
    return {
        "session": {
            "id": session_row.id, "name": session_row.name,
            "latitude": session_row.latitude, "longitude": session_row.longitude,
        },
        "n_samples": len(samples),
        "samples": [
            {"timestamp": s.timestamp.isoformat(), "vector_result": s.vector_result}
            for s in samples
        ],
    }

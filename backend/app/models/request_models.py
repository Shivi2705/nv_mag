from pydantic import BaseModel, Field
from typing import Optional
import datetime as dt


class CollectionRequest(BaseModel):
    session_name: str = Field(..., example="Ahmedabad_morning_run")
    latitude: float
    longitude: float
    altitude_m: float = 0.0
    start_time: Optional[dt.datetime] = None   # defaults to now
    duration_min: int = 60
    sample_interval_s: int = 60                # 60 -> 60 samples/hour
    true_Bx_uT: Optional[float] = None         # ground-truth field for simulation (optional)
    true_By_uT: Optional[float] = None
    true_Bz_uT: Optional[float] = None


class NVConfigRequest(BaseModel):
    D_GHz: float = 2.87
    E_GHz: float = 0.0032
    gamma_NV_GHz_per_T: float = 28.024
    linewidth_MHz: float = 6.0
    contrast_pct: float = 18.0


class LocalizationRequest(BaseModel):
    session_id: int
    sample_id: Optional[int] = None  # if None, use latest sample

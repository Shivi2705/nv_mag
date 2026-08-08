from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import datetime as dt


class SampleResult(BaseModel):
    timestamp: dt.datetime
    nv_odmr: Dict[str, Any]
    vector_result: Dict[str, Any]
    position_result: Optional[Dict[str, Any]] = None


class SessionResult(BaseModel):
    session_id: int
    name: str
    latitude: float
    longitude: float
    altitude_m: float
    n_samples: int
    csv_path: Optional[str] = None


class CollectionResponse(BaseModel):
    session: SessionResult
    samples: List[SampleResult]

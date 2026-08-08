"""
SQLAlchemy ORM models: one Session (a 60-min real-time collection run at a
place/time) has many Samples (one row per timestamp, mirrors the CSV schema).
"""
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.database import Base
import datetime as dt


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    altitude_m = Column(Float)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    sample_interval_s = Column(Integer, default=60)
    created_at = Column(DateTime, default=dt.datetime.utcnow)
    calibration = Column(JSON, nullable=True)

    samples = relationship("Sample", back_populates="session", cascade="all, delete-orphan")


class Sample(Base):
    __tablename__ = "samples"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    timestamp = Column(DateTime, index=True)

    temperature_K = Column(Float)
    kp_index = Column(Float)
    dst_index_nT = Column(Float)

    B_map_north_nT = Column(Float)
    B_map_east_nT = Column(Float)
    B_map_down_nT = Column(Float)
    B_map_total_nT = Column(Float)
    declination_deg = Column(Float)
    inclination_deg = Column(Float)

    D_GHz = Column(Float)
    E_GHz = Column(Float)
    gamma_NV_GHz_per_T = Column(Float)

    # store the 4 NV ODMR fit results + reconstructed vector as JSON blobs
    nv_odmr = Column(JSON)          # {"NV1": {"f_minus":..,"f_plus":..,...}, ...}
    vector_result = Column(JSON)    # {"Bx_uT":.., "By_uT":.., ...}
    position_result = Column(JSON)  # {"x":.., "y":.., "z":.., "error_m":..}

    session = relationship("Session", back_populates="samples")

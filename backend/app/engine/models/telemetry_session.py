from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

class TelemetrySession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", nullable=True)
    track: str
    car: str
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    best_lap: Optional[float] = None
    lap_count: int = 0
    data_file_path: Optional[str] = None # Path to JSON/CSV file
    
    class Config:
        arbitrary_types_allowed = True

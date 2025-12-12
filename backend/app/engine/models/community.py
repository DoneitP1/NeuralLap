from typing import Optional, List
from sqlmodel import Field, SQLModel
from datetime import datetime

# --- SETUP MARKETPLACE MODELS ---

class SetupBase(SQLModel):
    name: str = Field(index=True)
    car: str = Field(index=True)
    track: str = Field(index=True)
    author: str
    description: Optional[str] = None
    price: float = 0.0 # Virtual credits or just 'free'
    data_json: str # JSON string containing the actual setup data

class Setup(SetupBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    downloads: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SetupCreate(SetupBase):
    pass

class SetupRead(SetupBase):
    id: int
    downloads: int
    created_at: datetime

# --- LEAGUE MODELS ---

class LeagueBase(SQLModel):
    name: str = Field(index=True)
    description: Optional[str] = None
    criteria: str = "fastest" # 'fastest', 'cleanest', 'consistent'

class League(LeagueBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class LeagueCreate(LeagueBase):
    pass

class LeagueRead(LeagueBase):
    id: int
    created_at: datetime

# --- LEAGUE ENTRY MODELS ---

class LeagueEntryBase(SQLModel):
    league_id: int = Field(foreign_key="league.id")
    driver_name: str
    lap_time: float # Seconds
    cleanliness_score: float # 0-100
    consistency_score: float # 0-100 (inverse of std_dev)
    
class LeagueEntry(LeagueEntryBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class LeagueEntryCreate(LeagueEntryBase):
    pass

class LeagueEntryRead(LeagueEntryBase):
    id: int
    timestamp: datetime

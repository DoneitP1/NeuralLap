from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.engine.models.community import (
    Setup, SetupCreate, SetupRead,
    League, LeagueCreate, LeagueRead,
    LeagueEntry, LeagueEntryCreate, LeagueEntryRead
)
from typing import List

router = APIRouter()

# --- SETUP ENDPOINTS ---

@router.post("/setups/", response_model=SetupRead)
def create_setup(*, session: Session = Depends(get_session), setup: SetupCreate):
    db_setup = Setup.from_orm(setup)
    session.add(db_setup)
    session.commit()
    session.refresh(db_setup)
    return db_setup

@router.get("/setups/", response_model=List[SetupRead])
def read_setups(
    *, 
    session: Session = Depends(get_session), 
    offset: int = 0, 
    limit: int = 100,
    car: str = None,
    track: str = None
):
    query = select(Setup)
    if car:
        query = query.where(Setup.car == car)
    if track:
        query = query.where(Setup.track == track)
    query = query.offset(offset).limit(limit)
    setups = session.exec(query).all()
    return setups

@router.get("/setups/{setup_id}", response_model=SetupRead)
def read_setup(*, session: Session = Depends(get_session), setup_id: int):
    setup = session.get(Setup, setup_id)
    if not setup:
        raise HTTPException(status_code=404, detail="Setup not found")
    return setup

# --- LEAGUE ENDPOINTS ---

@router.post("/leagues/", response_model=LeagueRead)
def create_league(*, session: Session = Depends(get_session), league: LeagueCreate):
    db_league = League.from_orm(league)
    session.add(db_league)
    session.commit()
    session.refresh(db_league)
    return db_league

@router.get("/leagues/", response_model=List[LeagueRead])
def read_leagues(*, session: Session = Depends(get_session), offset: int = 0, limit: int = 100):
    leagues = session.exec(select(League).offset(offset).limit(limit)).all()
    return leagues

@router.post("/leagues/submit", response_model=LeagueEntryRead)
def submit_league_entry(*, session: Session = Depends(get_session), entry: LeagueEntryCreate):
    # Verify league exists
    league = session.get(League, entry.league_id)
    if not league:
         raise HTTPException(status_code=404, detail="League not found")
         
    db_entry = LeagueEntry.from_orm(entry)
    session.add(db_entry)
    session.commit()
    session.refresh(db_entry)
    return db_entry

@router.get("/leagues/{league_id}/entries", response_model=List[LeagueEntryRead])
def read_league_entries(
    *, 
    session: Session = Depends(get_session), 
    league_id: int,
    sort_by: str = "fastest" # fastest, cleanest, consistent
):
    query = select(LeagueEntry).where(LeagueEntry.league_id == league_id)
    entries = session.exec(query).all()
    
    # Sorting logic in Python for simplicity with complex criteria, or could be SQL
    if sort_by == 'fastest':
        entries = sorted(entries, key=lambda x: x.lap_time)
    elif sort_by == 'cleanest':
        entries = sorted(entries, key=lambda x: x.cleanliness_score, reverse=True)
    elif sort_by == 'consistent':
        entries = sorted(entries, key=lambda x: x.consistency_score, reverse=True)
        
    return entries

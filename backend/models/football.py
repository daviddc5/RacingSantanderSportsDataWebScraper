from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, date


class PlayerBase(BaseModel):
    name: str = Field(..., max_length=255)
    position: Optional[str] = Field(None, max_length=100)
    age: Optional[int] = None
    nationality: Optional[str] = Field(None, max_length=10)
    photo: Optional[str] = Field(None, max_length=500)
    number: Optional[str] = Field(None, max_length=10)
    matches: Optional[int] = Field(default=0)
    goals: Optional[int] = Field(default=0)
    assists: Optional[int] = Field(default=0)


class PlayerCreate(PlayerBase):
    """Model for creating new players"""
    pass


class PlayerUpdate(BaseModel):
    """Model for updating players - all fields are optional"""
    name: Optional[str] = Field(None, max_length=255)
    position: Optional[str] = Field(None, max_length=100)
    age: Optional[int] = None
    nationality: Optional[str] = Field(None, max_length=10)
    photo: Optional[str] = Field(None, max_length=500)
    number: Optional[str] = Field(None, max_length=10)
    matches: Optional[int] = None
    goals: Optional[int] = None
    assists: Optional[int] = None


class Player(PlayerBase):
    """Model for players with database fields"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class FixtureBase(BaseModel):
    fixture_date: Optional[date] = None
    home_team: Optional[str] = Field(None, max_length=255)
    away_team: Optional[str] = Field(None, max_length=255)
    home_logo: Optional[str] = Field(None, max_length=500)
    away_logo: Optional[str] = Field(None, max_length=500)
    competition: Optional[str] = Field(None, max_length=255)
    round: Optional[str] = Field(None, max_length=255)
    venue: Optional[str] = Field(None, max_length=50)
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    result: Optional[str] = Field(None, max_length=1)  # W, L, D
    attendance: Optional[str] = Field(None, max_length=50)
    referee: Optional[str] = Field(None, max_length=255)


class FixtureCreate(FixtureBase):
    """Model for creating new fixtures"""
    pass


class FixtureUpdate(BaseModel):
    """Model for updating fixtures - all fields are optional"""
    fixture_date: Optional[date] = None
    home_team: Optional[str] = Field(None, max_length=255)
    away_team: Optional[str] = Field(None, max_length=255)
    home_logo: Optional[str] = Field(None, max_length=500)
    away_logo: Optional[str] = Field(None, max_length=500)
    competition: Optional[str] = Field(None, max_length=255)
    round: Optional[str] = Field(None, max_length=255)
    venue: Optional[str] = Field(None, max_length=50)
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    result: Optional[str] = Field(None, max_length=1)
    attendance: Optional[str] = Field(None, max_length=50)
    referee: Optional[str] = Field(None, max_length=255)


class Fixture(FixtureBase):
    """Model for fixtures with database fields"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class StandingBase(BaseModel):
    position: Optional[int] = None
    points: Optional[int] = None
    played: Optional[int] = None
    won: Optional[int] = None
    drawn: Optional[int] = None
    lost: Optional[int] = None
    goal_difference: Optional[int] = None
    season: Optional[str] = Field(default="2024-25", max_length=20)


class StandingCreate(StandingBase):
    """Model for creating new standings"""
    pass


class StandingUpdate(BaseModel):
    """Model for updating standings - all fields are optional"""
    position: Optional[int] = None
    points: Optional[int] = None
    played: Optional[int] = None
    won: Optional[int] = None
    drawn: Optional[int] = None
    lost: Optional[int] = None
    goal_difference: Optional[int] = None
    season: Optional[str] = Field(None, max_length=20)


class Standing(StandingBase):
    """Model for standings with database fields"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DataCacheBase(BaseModel):
    data_type: str = Field(..., max_length=50)
    last_scraped: Optional[datetime] = None
    last_updated: Optional[datetime] = None
    is_updating: Optional[bool] = Field(default=False)
    error_message: Optional[str] = None


class DataCacheCreate(DataCacheBase):
    """Model for creating new data cache entries"""
    pass


class DataCacheUpdate(BaseModel):
    """Model for updating data cache entries"""
    last_scraped: Optional[datetime] = None
    last_updated: Optional[datetime] = None
    is_updating: Optional[bool] = None
    error_message: Optional[str] = None


class DataCache(DataCacheBase):
    """Model for data cache with database fields"""
    id: int
    
    class Config:
        from_attributes = True


# Response models for API endpoints
class FootballDataResponse(BaseModel):
    """Standard response format for football data"""
    success: bool
    data: Dict[str, Any]
    message: str
    request_id: str
    from_cache: bool = True
    last_updated: Optional[datetime] = None 
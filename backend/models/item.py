from typing import Optional
from pydantic import BaseModel, Field


class ItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., gt=0, description="Price must be greater than 0")
    is_offer: Optional[bool] = False


class ItemCreate(ItemBase):
    """Model for creating new items"""
    pass


class ItemUpdate(BaseModel):
    """Model for updating items - all fields are optional"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[float] = Field(None, gt=0, description="Price must be greater than 0")
    is_offer: Optional[bool] = None


class Item(ItemBase):
    """Model for items with database fields"""
    id: int
    
    class Config:
        from_attributes = True 
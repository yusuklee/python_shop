from typing import List, Optional
from pydantic import BaseModel, Field

# ============ Item Models ============

class ItemBaseModel(BaseModel):
    id: Optional[int] = None
    name: str
    stock: int
    price: int
    image_url: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True


class ItemCountBaseModel(BaseModel):
    item_id: int
    count: int


class MovieBaseModel(ItemBaseModel):
    director: str
    actor: str


class AlbumBaseModel(ItemBaseModel):
    artist: str
    etc: Optional[str] = None


class BookBaseModel(ItemBaseModel):
    author: str
    isbn: int


# ============ Member Models ============

class MemberBaseModel(BaseModel):
    id: Optional[int] = None
    name: str = Field(..., min_length=2, max_length=20)
    password: str = Field(..., min_length=5, max_length=20)
    email:str=Field(...,min_length=5, max_length=30)
    zip: str = Field(..., max_length=30)
    addr1: str = Field(..., max_length=30)
    addr2: str = Field(..., max_length=30)

    class Config:
        from_attributes = True


class MemberLogin(BaseModel):
    email:str=Field(...,min_length=5, max_length=30)
    password:str=Field(...,min_length=3,max_length=30)


# ============ Administrator Models ============

class AdminBaseModel(BaseModel):
    id: Optional[int] = None
    name: str = Field(..., min_length=2, max_length=50)
    email: str = Field(..., min_length=5, max_length=50)
    password: str = Field(..., min_length=5, max_length=255)

    class Config:
        from_attributes = True


# ============ Order Models ============

class Item_count(BaseModel):
    item_id: int
    count: int


class OrderBaseModel(BaseModel):
    zip: str
    addr1: str
    addr2: str
    items: list[Item_count]

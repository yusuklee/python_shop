from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db
from core.item_service import ItemService
from schemas.dto import ItemBaseModel,BookBaseModel, AlbumBaseModel,MovieBaseModel

router = APIRouter(prefix="/item", tags=["Item"])

def get_item_service(db: Session = Depends(get_db)):
    return ItemService(db)

#생성
@router.post("/create/book")
def item_create_book(input_info: BookBaseModel, service: ItemService = Depends(get_item_service)):
    book = service.create_book(input_info)
    return {
        "id": book.id,
        "name": book.name,
        "price": book.price,
        "stock": book.stock,
        "type": book.type,
        "author": book.author,
        "isbn": book.isbn,
    }


@router.post("/create/album")
def item_create_album(input_info: AlbumBaseModel, service: ItemService = Depends(get_item_service)):
    album = service.create_album(input_info)
    return {
        "id": album.id,
        "name": album.name,
        "price": album.price,
        "stock": album.stock,
        "type": album.type,
        "artist": album.artist,
        "etc": album.etc,
    }

@router.post("/create/movie")
def item_create_movie(input_info: MovieBaseModel, service: ItemService = Depends(get_item_service)):
    movie = service.create_movie(input_info)
    return {
        "id": movie.id,
        "name": movie.name,
        "price": movie.price,
        "stock": movie.stock,
        "type": movie.type,
        "director": movie.director,
        "actor": movie.actor,
    }


#조회
@router.get("/show/all")
def show_all(service: ItemService = Depends(get_item_service)):
    read_all = service.read_all()
    # Convert SQLAlchemy models to dict with all fields
    result = []
    for item in read_all:
        item_dict = {
            "id": item.id,
            "name": item.name,
            "price": item.price,
            "stock": item.stock,
            "type": item.type,
        }
        # Add type-specific fields
        if hasattr(item, 'author'):
            item_dict["author"] = item.author
        if hasattr(item, 'isbn'):
            item_dict["isbn"] = item.isbn
        if hasattr(item, 'artist'):
            item_dict["artist"] = item.artist
        if hasattr(item, 'etc'):
            item_dict["etc"] = item.etc
        if hasattr(item, 'director'):
            item_dict["director"] = item.director
        if hasattr(item, 'actor'):
            item_dict["actor"] = item.actor
        result.append(item_dict)
    return result

@router.get("/show/{id}")
def show_by_id(id:int, service: ItemService = Depends(get_item_service)):
    by_id = service.read_item_by_id(id)
    if by_id:
        item_dict = {
            "id": by_id.id,
            "name": by_id.name,
            "price": by_id.price,
            "stock": by_id.stock,
            "type": by_id.type,
        }
        if hasattr(by_id, 'author'):
            item_dict["author"] = by_id.author
        if hasattr(by_id, 'isbn'):
            item_dict["isbn"] = by_id.isbn
        if hasattr(by_id, 'artist'):
            item_dict["artist"] = by_id.artist
        if hasattr(by_id, 'etc'):
            item_dict["etc"] = by_id.etc
        if hasattr(by_id, 'director'):
            item_dict["director"] = by_id.director
        if hasattr(by_id, 'actor'):
            item_dict["actor"] = by_id.actor
        return item_dict

    raise HTTPException(
        status_code=404,
        detail="상품이 존재하지 않습니다."
    )

#업데이트
@router.patch("/update/{id}")
def update_by_id(id: int, payload: ItemBaseModel, service: ItemService = Depends(get_item_service)):
    item = service.update_item(id, payload)
    if item:
        item_dict = {
            "id": item.id,
            "name": item.name,
            "price": item.price,
            "stock": item.stock,
            "type": item.type,
        }
        if hasattr(item, 'author'):
            item_dict["author"] = item.author
        if hasattr(item, 'isbn'):
            item_dict["isbn"] = item.isbn
        if hasattr(item, 'artist'):
            item_dict["artist"] = item.artist
        if hasattr(item, 'etc'):
            item_dict["etc"] = item.etc
        if hasattr(item, 'director'):
            item_dict["director"] = item.director
        if hasattr(item, 'actor'):
            item_dict["actor"] = item.actor
        return item_dict

    raise HTTPException(
        status_code=404,
        detail="상품이 존재하지 않습니다."
    )

#삭제
@router.delete("/delete/{id}")
def delete_by_id(id: int, service: ItemService = Depends(get_item_service)):
    result = service.delete_item(id)
    if result:
        return result

    raise HTTPException(
        status_code=404,
        detail="상품이 존재하지 않습니다."
    )



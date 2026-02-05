import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from db.session import get_db
from core.item_service import ItemService
from schemas.dto import ItemBaseModel,BookBaseModel, AlbumBaseModel,MovieBaseModel

router = APIRouter(prefix="/item", tags=["Item"])

# 이미지 저장 경로
UPLOAD_DIR = "static/images/items"
os.makedirs(UPLOAD_DIR, exist_ok=True)

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
        "image_url": book.image_url,
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
        "image_url": album.image_url,
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
        "image_url": movie.image_url,
        "director": movie.director,
        "actor": movie.actor,
    }


# Helper function to convert item to dict
def item_to_dict(item, include_categories=False):
    item_dict = {
        "id": item.id,
        "name": item.name,
        "price": item.price,
        "stock": item.stock,
        "type": item.type,
        "image_url": item.image_url,
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
    # Add categories if requested
    if include_categories and hasattr(item, 'category_items'):
        item_dict["categories"] = [
            {"id": ci.category.id, "name": ci.category.name}
            for ci in item.category_items if ci.category
        ]
    return item_dict


#조회
@router.get("/show/all")
def show_all(service: ItemService = Depends(get_item_service)):
    read_all = service.read_all()
    return [item_to_dict(item, include_categories=True) for item in read_all]

@router.get("/show/by-category/{category_id}")
def show_by_category(category_id: int, item_type: str = None, service: ItemService = Depends(get_item_service)):
    items = service.read_by_category(category_id, item_type)
    return [item_to_dict(item, include_categories=True) for item in items]


@router.get("/show/{id}")
def show_by_id(id:int, service: ItemService = Depends(get_item_service)):
    by_id = service.read_item_by_id(id)
    if by_id:
        return item_to_dict(by_id, include_categories=True)

    raise HTTPException(
        status_code=404,
        detail="상품이 존재하지 않습니다."
    )

#업데이트
@router.patch("/update/{id}")
def update_by_id(id: int, payload: ItemBaseModel, service: ItemService = Depends(get_item_service)):
    item = service.update_item(id, payload)
    if item:
        return item_to_dict(item, include_categories=True)

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


@router.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    # 파일 확장자 추출
    ext = os.path.splitext(file.filename)[1]
    # UUID로 고유 파일명 생성
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    return {"url": f"/static/images/items/{unique_filename}"}

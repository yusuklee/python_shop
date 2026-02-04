from fastapi import APIRouter, Depends, HTTPException
from fastapi.params import Body
from sqlalchemy.orm import Session
from typing import Annotated

from core.category_service import CategoryService
from db.session import get_db


router = APIRouter(prefix="/category", tags=['Category'])


def get_category_service(db: Session = Depends(get_db)):
    return CategoryService(db)


depends = Annotated[CategoryService, Depends(get_category_service)]
strBody = Annotated[str | None, Body()]
intBody = Annotated[int | None, Body()]


def category_to_dict(category):
    if category is None:
        return None
    return {
        "id": category.id,
        "name": category.name,
        "description": category.description,
        "parent_id": category.parent_id,
    }


@router.post("/create")
def create_category(name: strBody, des: strBody, service: depends):
    category = service.createCategory(name, des)
    return category_to_dict(category)


@router.patch("/add_child")
def add_child(ca_name: strBody, child_name: strBody, service: depends):
    category = service.add_child(ca_name=ca_name, child_name=child_name)
    if category is None:
        raise HTTPException(status_code=404, detail="카테고리를 찾을 수 없습니다.")
    return category_to_dict(category)


@router.patch("/add_parent")
def add_parent(ca_name: strBody, parent_name: strBody, service: depends):
    category = service.add_parent(ca_name=ca_name, parent_name=parent_name)
    if category is None:
        raise HTTPException(status_code=404, detail="카테고리를 찾을 수 없습니다.")
    return category_to_dict(category)


@router.patch("/connect")
def connect_ca_it(item_id: intBody, ca_name: strBody, service: depends):
    result = service.connect_category_item(item_id=item_id, ca_name=ca_name)
    return result  # boolean


@router.delete("/delete/{ca_name}")
def remove_category(ca_name: str, service: depends):
    result = service.remove_category(ca_name=ca_name)
    return result


@router.patch("/update")
def update_category(ca_name: strBody, name: strBody, des: strBody, service: depends):
    updated_category = service.update_category(ca_name=ca_name, name=name, des=des)
    if updated_category is None:
        raise HTTPException(status_code=404, detail="카테고리를 찾을 수 없습니다.")
    return category_to_dict(updated_category)


@router.get("/show/{id}")
def show_category(id: int, service: depends):
    category = service.show_category(id=id)
    if category is None:
        raise HTTPException(status_code=404, detail="카테고리를 찾을 수 없습니다.")
    return category_to_dict(category)

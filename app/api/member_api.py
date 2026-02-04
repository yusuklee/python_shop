from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# 아까 만든 모델들 가져오기
from db.session import get_db
from core.member_service import MemberService
from schemas.dto import MemberBaseModel

router = APIRouter(prefix="/member", tags=["Member"])


# 의존성 주입을 위해 서비스 객체 생성 함수
def get_member_service(db: Session = Depends(get_db)):
    return MemberService(db)


# 1. 회원 생성
@router.post("/create")
def member_create(input_info: MemberBaseModel, service: MemberService = Depends(get_member_service)):
    return_data = service.create_member(input_info)
    return {
        "id": return_data.id,
        "name": return_data.name,
        "password": return_data.password,
        "zip": return_data.zip,
        "addr1": return_data.addr1,
        "addr2": return_data.addr2,
    }


# 2. 회원 목록 조회
@router.get("/show/all")
def show_member(service: MemberService = Depends(get_member_service)):
    members = service.find_all()
    result = []
    for member in members:
        result.append({
            "id": member.id,
            "name": member.name,
            "password": member.password,
            "zip": member.zip,
            "addr1": member.addr1,
            "addr2": member.addr2,
        })
    return result


@router.get("/show/{id}")
def show_member_by_id(id: int, service: MemberService = Depends(get_member_service)):
    find_by_id = service.find_by_id(id)
    if find_by_id:
        return {
            "id": find_by_id.id,
            "name": find_by_id.name,
            "password": find_by_id.password,
            "zip": find_by_id.zip,
            "addr1": find_by_id.addr1,
            "addr2": find_by_id.addr2,
        }
    else:
        raise HTTPException(
            status_code=404,
            detail="회원이 존재하지 않습니다."
        )


#3. 회원 삭제
@router.delete("/delete/{id}")
def delete_member(id: int, service: MemberService = Depends(get_member_service)):
    member = service.delete_member(id)
    if member:
        return {
            "id": member.id,
            "name": member.name,
            "password": member.password,
            "zip": member.zip,
            "addr1": member.addr1,
            "addr2": member.addr2,
        }
    raise HTTPException(
        status_code=404,
        detail="회원이 존재하지 않습니다."
    )


#4.회원 업데이트
@router.patch("/update/{id}")
def update_member(id: int, payload: dict, service: MemberService = Depends(get_member_service)):
    member = service.update_member(id, payload)
    if member:
        return {
            "id": member.id,
            "name": member.name,
            "password": member.password,
            "zip": member.zip,
            "addr1": member.addr1,
            "addr2": member.addr2,
        }
    raise HTTPException(
        status_code=404,
        detail="회원이 존재하지 않습니다."
    )

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import bcrypt
from schemas.dto import MemberLogin
from typing import Annotated, Optional
from jose import JWTError, jwt
from db.session import get_db
from core.member_service import MemberService
from models.member import Member
from models.administrator import Administrator
from schemas.dto import MemberBaseModel
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/member", tags=["Member"])
security = HTTPBearer()

# 해시 함수 (bcrypt 직접 사용)
def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

    SECRET_KEY = "SECRET_KEY"  # 노출되어선 안됩니다!! (환경변수로 관리)

SECRET_KEY = "SECRET_KEY"
ALGORITHM = "HS256"
UTC = timezone.utc
# https://suwani.tistory.com/188 블로그 참고
def create_access_token(
    data: dict, expires_delta: Optional[timedelta] = timedelta(minutes=15)
):
    to_encode = data.copy()
    expire = datetime.now(tz=UTC) + expires_delta

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt



def get_member_service(db: Session = Depends(get_db)):
    return MemberService(db)


service_ = Annotated[MemberService, Depends(get_member_service)]
db_ = Annotated[Session,Depends(get_db)]


# 1-1. 회원 가입
@router.post("/signup")
async def member_create(input_info: MemberBaseModel,  db: db_):
    db_user = db.query(Member).filter(Member.email==input_info.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="이메일 중복임")

    hashed_password = get_password_hash(input_info.password)
    input_info.password = hashed_password
    db_user = Member(
        **input_info.model_dump()
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "zip": db_user.zip,
        "addr1": db_user.addr1,
        "addr2": db_user.addr2,
    }

#1-2 로그인 (관리자/회원 통합)
@router.post("/login")
async def login(user_credentials: MemberLogin, db: db_):
    # 먼저 관리자 테이블에서 확인
    admin = db.query(Administrator).filter(Administrator.email == user_credentials.email).first()
    if admin and verify_password(user_credentials.password, admin.password):
        access_token = create_access_token(
            data={"sub": admin.email, "user_type": "admin", "user_id": admin.id},
            expires_delta=timedelta(minutes=30)
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_type": "admin",
            "user": {
                "id": admin.id,
                "name": admin.name,
                "email": admin.email
            }
        }

    # 회원 테이블에서 확인
    user = db.query(Member).filter(Member.email == user_credentials.email).first()
    if user and verify_password(user_credentials.password, user.password):
        access_token = create_access_token(
            data={"sub": user.email, "user_type": "member", "user_id": user.id},
            expires_delta=timedelta(minutes=30)
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_type": "member",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "zip": user.zip,
                "addr1": user.addr1,
                "addr2": user.addr2
            }
        }

    raise HTTPException(
        status_code=404,
        detail="이메일 또는 비밀번호가 올바르지 않습니다."
    )


# 현재 로그인한 사용자 정보 조회
@router.get("/me")
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        user_type = payload.get("user_type")
        user_id = payload.get("user_id")

        if email is None or user_type is None:
            raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")

        if user_type == "admin":
            admin = db.query(Administrator).filter(Administrator.id == user_id).first()
            if admin:
                return {
                    "user_type": "admin",
                    "user": {
                        "id": admin.id,
                        "name": admin.name,
                        "email": admin.email
                    }
                }
        else:
            user = db.query(Member).filter(Member.id == user_id).first()
            if user:
                return {
                    "user_type": "member",
                    "user": {
                        "id": user.id,
                        "name": user.name,
                        "email": user.email,
                        "zip": user.zip,
                        "addr1": user.addr1,
                        "addr2": user.addr2
                    }
                }

        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    except JWTError:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")





# 2. 회원 목록 조회
@router.get("/show/all")
async def show_member(service: service_):
    members = service.find_all()
    result = []
    for member in members:
        result.append({
            "id": member.id,
            "name": member.name,
            "password": member.password,
            "email":member.email,
            "zip": member.zip,
            "addr1": member.addr1,
            "addr2": member.addr2,
        })
    return result


@router.get("/show/{id}")
async def show_member_by_id(id: int, service: service_):
    find_by_id = service.find_by_id(id)
    if find_by_id:
        return {
            "id": find_by_id.id,
            "name": find_by_id.name,
            "password": find_by_id.password,
            "email": find_by_id.email,
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
async def delete_member(id: int, service: service_):
    member = service.delete_member(id)
    if member:
        return {
            "id": member.id,
            "name": member.name,
            "password": member.password,
            "email": member.email,
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
async def update_member(id: int, payload: dict, service: service_):
    member = service.update_member(id, payload)
    if member:
        return {
            "id": member.id,
            "name": member.name,
            "password": member.password,
            "email": member.email,
            "zip": member.zip,
            "addr1": member.addr1,
            "addr2": member.addr2,
        }
    raise HTTPException(
        status_code=404,
        detail="회원이 존재하지 않습니다."
    )

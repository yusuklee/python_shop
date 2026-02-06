# 알빠노 SHOP

쇼핑몰 관리 시스템으로, 회원/상품/카테고리/주문을 관리할 수 있는 풀스택 웹 애플리케이션입니다.

## 기술 스택

### Backend
- **Framework**: FastAPI
- **ORM**: SQLAlchemy
- **Database**: MySQL
- **Validation**: Pydantic
- **Migration**: Alembic

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: TailwindCSS 4
- **Component**: shadcn/ui, Radix UI
- **State Management**: SWR
- **Form**: React Hook Form + Zod

## 프로젝트 구조

```
Python_Shop/
├── app/                    # Backend (FastAPI)
│   ├── api/                # API 라우터
│   │   ├── member_api.py   # 회원 API
│   │   ├── item_api.py     # 상품 API
│   │   ├── order_api.py    # 주문 API
│   │   └── category_api.py # 카테고리 API
│   ├── core/               # 비즈니스 로직 (Service Layer)
│   ├── crud/               # 데이터베이스 CRUD (Repository Layer)
│   ├── models/             # SQLAlchemy 모델
│   │   ├── item/           # 상품 모델 (Book, Album, Movie)
│   │   ├── member.py       # 회원 모델
│   │   ├── order.py        # 주문 모델
│   │   └── category.py     # 카테고리 모델
│   ├── schemas/            # Pydantic DTO
│   ├── db/                 # 데이터베이스 설정
│   ├── alembic/            # DB 마이그레이션
│   ├── tests/              # 테스트 코드
│   └── main.py             # FastAPI 앱 진입점
│
├── Front/                  # Frontend (Next.js)
│   ├── app/                # App Router 페이지
│   │   ├── login/          # 로그인 페이지
│   │   ├── signup/         # 회원가입 페이지
│   │   ├── shop/           # 쇼핑 페이지
│   │   ├── items/          # 상품 관리 (관리자)
│   │   ├── members/        # 회원 관리 (관리자)
│   │   ├── orders/         # 주문/장바구니
│   │   └── categories/     # 카테고리 관리 (관리자)
│   ├── components/         # React 컴포넌트
│   │   └── ui/             # shadcn/ui 컴포넌트
│   ├── lib/                # 유틸리티 및 API 클라이언트
│   └── styles/             # 글로벌 스타일
│
└── static/                 # 정적 파일 (이미지 등)
```

## 주요 기능

### 회원 기능
- 회원가입 (카카오 우편번호 서비스 연동)
- 로그인/로그아웃
- 회원 정보 관리

### 상품 기능
- 상품 등록/수정/삭제
- 상품 유형: 도서(Book), 앨범(Album), 영화(Movie)
- 상품 이미지 업로드
- 카테고리별 상품 필터링

### 카테고리 기능
- 계층형 카테고리 구조 (부모-자식 관계)
- 카테고리별 상품 연결

### 주문 기능
- 장바구니 담기
- 주문 생성
- 배송지 정보 입력 (카카오 우편번호 서비스 연동)
- 주문 내역 조회

## 설치 및 실행

### 사전 요구사항
- Python 3.10+
- Node.js 18+
- MySQL 8.0+

### 1. 데이터베이스 설정

MySQL에서 데이터베이스 생성:
```sql
CREATE DATABASE python_shop;
```

### 2. Backend 설정

```bash
# 백엔드 디렉토리 이동
cd app

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 데이터베이스 마이그레이션
alembic upgrade head

# 서버 실행
uvicorn main:app --reload --port 8000
```

### 3. Frontend 설정

```bash
# 프론트엔드 디렉토리 이동
cd Front

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 4. 접속
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API 문서 (Swagger)**: http://localhost:8000/docs

## 환경 변수

### Backend (`app/db/session.py`)
```python
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:root1234@localhost:3306/python_shop"
```

필요에 따라 데이터베이스 연결 정보를 수정하세요.

## API 엔드포인트

### Member API (`/member`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/member/create` | 회원 가입 |
| POST | `/member/login` | 로그인 |
| GET | `/member/show/all` | 전체 회원 조회 |
| GET | `/member/show/{id}` | 회원 상세 조회 |
| PATCH | `/member/update/{id}` | 회원 정보 수정 |
| DELETE | `/member/delete/{id}` | 회원 삭제 |

### Item API (`/item`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/item/create/book` | 도서 등록 |
| POST | `/item/create/album` | 앨범 등록 |
| POST | `/item/create/movie` | 영화 등록 |
| GET | `/item/show/all` | 전체 상품 조회 |
| GET | `/item/show/{id}` | 상품 상세 조회 |
| GET | `/item/show/by-category/{id}` | 카테고리별 상품 조회 |
| PATCH | `/item/update/{id}` | 상품 수정 |
| DELETE | `/item/delete/{id}` | 상품 삭제 |
| POST | `/item/upload/image` | 이미지 업로드 |

### Category API (`/category`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/category/create` | 카테고리 생성 |
| GET | `/category/show/all` | 전체 카테고리 조회 (계층형) |
| GET | `/category/show/all/flat` | 전체 카테고리 조회 (평면) |
| PATCH | `/category/update/{name}` | 카테고리 수정 |
| DELETE | `/category/delete/{name}` | 카테고리 삭제 |
| POST | `/category/connect` | 상품-카테고리 연결 |
| DELETE | `/category/disconnect` | 상품-카테고리 연결 해제 |

### Order API (`/order`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/order/create/{member_id}` | 주문 생성 |
| GET | `/order/show/all` | 전체 주문 조회 |
| GET | `/order/show/{id}` | 주문 상세 조회 |
| GET | `/order/show/member/{member_id}` | 회원별 주문 조회 |

## 스크린샷

### 로그인 페이지
로그인 및 회원가입 기능을 제공합니다.

### 상품 관리
도서, 앨범, 영화 상품을 등록하고 관리할 수 있습니다.

### 쇼핑 페이지
카테고리별로 상품을 조회하고 장바구니에 담을 수 있습니다.

## 테스트 실행

```bash
cd app
pytest
```

## 라이선스

MIT License

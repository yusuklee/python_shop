from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# MySQL 연결 주소
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:root1234@localhost:3306/python_shop"

engine = create_engine(SQLALCHEMY_DATABASE_URL)   #db와 물리적 연결
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) 

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

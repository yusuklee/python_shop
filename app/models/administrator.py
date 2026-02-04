from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, backref
from db.session import Base


class Administrator(Base):
    __tablename__="administrator"

    id=Column(Integer, primary_key=True, index=True)
    name = Column(String(50))
    email=Column(String(50))
    password=Column(String(255))


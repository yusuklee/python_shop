from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from db.session import Base


class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50))
    password = Column(String(255))

    zip = Column(String(30), nullable=False)
    addr1 = Column(String(30))
    addr2 = Column(String(30))
    orders = relationship("Order", back_populates="member")

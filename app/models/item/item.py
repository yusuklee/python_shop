from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.session import Base

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    price = Column(Integer, default=0)
    stock = Column(Integer, default=0)
    type = Column(String(20))
    image_url = Column(String(255),nullable=True)

    __mapper_args__ = {
        "polymorphic_on":type,      #type이라는 컬럼으로 자식을 구분할것이다
        "polymorphic_identity":"ITEM"  #이 클래스가 db에 저장될떄 찍힐 고유이름
    }

    category_items = relationship(
        "CategoryItem",
        back_populates="item",
        cascade="all, delete-orphan"
    )

    order_items = relationship(
        "OrderItem",
        back_populates="item"
    )

    def remove_stock(self, count:int):
        rest_stock = self.stock - count
        if rest_stock < 0:
            raise ValueError(f"수량이 부족합니다. 현재 재고: {self.stock}")
        self.stock = rest_stock

    def add_stock(self,count:int):
        self.stock+=count

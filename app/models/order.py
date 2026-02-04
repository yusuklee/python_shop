from datetime import datetime
from sqlalchemy import Column, Integer,ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from db.session import Base
from models.member import Member
from models.order_item import OrderItem
from models.delivery import Delivery
from models.item.item import Item
from models.status.order_status import  OrderStatus




class Order(Base):
    __tablename__ = "orders"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    total_price = Column(Integer, default=0)
    order_date = Column(DateTime, default=datetime.now)
    status = Column(Enum(OrderStatus), default=OrderStatus.ORDER_READY)

    member_id = Column(Integer, ForeignKey("members.id"))
    member = relationship("Member", back_populates="orders")

    order_items = relationship("OrderItem",back_populates="order",cascade="all, delete-orphan")
    delivery = relationship("Delivery", back_populates="order", uselist=False, cascade="all, delete-orphan")
    #zip addr1 addr2
    #order만들떄 memberid path로 받고














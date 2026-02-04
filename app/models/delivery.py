from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from db.session import Base

from models.status.delivery_status import DeliveryStatus

class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)

    zip=  Column(String(50))
    addr1=  Column(String(50))
    addr2=  Column(String(50))
    # 1:1 관계에서는 ForeignKey가 있는 쪽이 관계의 주인
    status = Column(Enum(DeliveryStatus), default=DeliveryStatus.DELIVERY_READY)
    order_id = Column(Integer, ForeignKey("orders.id"))
    order = relationship("Order", back_populates="delivery", uselist=False)

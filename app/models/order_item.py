from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from db.session import Base


class OrderItem(Base):
    __tablename__ = 'order_items'

    id = Column(Integer,primary_key=True, index=True)
    count = Column(Integer, nullable=False)

    #다대일
    item_id = Column(Integer, ForeignKey("items.id"))
    item = relationship("Item", back_populates='order_items')

    order_id = Column(Integer, ForeignKey("orders.id"))
    order = relationship("Order", back_populates="order_items")

#생성 메서드 -> order 의 total price 업데이트,  item의 개수 줄이기 (확인하면서)
    @classmethod
    def create_order_item(cls, order, item, count):
        order_item = cls(
            order=order,
            item=item,
            count=count
        )
        if item.stock >= count:
            item.stock -= count
            order.total_price += count * item.price
            return order_item
        else:
            return None


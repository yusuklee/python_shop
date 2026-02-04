from sqlalchemy.orm import Session
from models.order import Order


class OrderRepository:
    def create(self, db:Session, order:Order):
        db.add(order)
        db.commit()
        db.refresh(order)
        return order

    def find_by_id(self, db:Session, order_id:int):
        return db.query(Order).filter(Order.id==order_id).first()

    def find_by_member_id(self, db:Session, member_id:int):
        return db.query(Order).filter(Order.member_id == member_id).all()

    def update(self, db:Session, order_id:int, update_content:dict):
        #update_content 는 name, password, zip, addr1, addr2 이렇게 구성
        updateOrder = self.find_by_id(db,order_id)
        if "total_price" in update_content.keys():
            updateOrder.total_price = update_content['total_price']
        if 'order_date' in update_content.keys():
            updateOrder.order_date = update_content['order_date']

        db.commit()
        db.refresh(updateOrder)
        return updateOrder


    def delete(self, db: Session, order_id: int) -> bool:
        db_order = self.find_by_id(db, order_id)
        if not db_order:
            return False
        db.delete(db_order)
        db.commit()
        return True

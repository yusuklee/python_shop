from sqlalchemy.orm import Session
from crud.order import OrderRepository
from models.order import Order
from models.order_item import OrderItem
from crud.item import ItemRepository
from crud.member import MemberRepository
from schemas.dto import Item_count
from models.delivery import Delivery

orderRepo = OrderRepository()
mr = MemberRepository()
ir = ItemRepository()

class OrderService:
    def __init__(self,db:Session):
        self.db = db

    def create_order(self, member_id:int, zip:str, addr1:str, addr2:str, item_count_list:list[Item_count]):
        member=mr.find_by_id(self.db,member_id)
        if member is None:
            return member
        delivery = Delivery(zip=zip, addr1=addr1, addr2 =addr2)


        for item_count in item_count_list:     # 주문 아이템이 재고보다 더많으면 주문 자체를 생성하면 안되기에 일단 체크먼저 하는것
            i = item_count.item_id
            c= item_count.count
            item=ir.find_by_id(self.db,i)
            if item is None:
                return None
            if item.stock < c:
                return None

        order = Order(member=member, delivery=delivery, total_price=0)  #테스트

        for item_count in item_count_list:
            i = item_count.item_id
            c= item_count.count
            item=ir.find_by_id(self.db,i)
            OrderItem.create_order_item(order=order, item=item, count=c)             #order부분수정함

        orderRepo.create(self.db,order) # Use orderRepo here

        return order

    def get_orders_by_member_id(self, member_id: int):
        return orderRepo.find_by_member_id(self.db, member_id)





        

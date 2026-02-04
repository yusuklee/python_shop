from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.order_service import OrderService
from db.session import get_db
from schemas.dto import OrderBaseModel


router = APIRouter(prefix="/order", tags=["order"])


def get_order_service(db: Session = Depends(get_db)):
    return OrderService(db)


@router.post("/create/{member_id}")
def create_order(dto:OrderBaseModel, member_id:int, service:OrderService=Depends(get_order_service)):
    item_count_list = dto.items
    zip = dto.zip
    addr1 = dto.addr1
    addr2 = dto.addr2
    temp = service.create_order(member_id,zip, addr1, addr2, item_count_list)
    if temp:
        return temp
    raise HTTPException(
        status_code=404,
        detail="주문이 취소 되었습니다."
    )

@router.get("/show/member/{member_id}")
def get_orders_by_member_id(member_id: int, service: OrderService = Depends(get_order_service)):
    orders = service.get_orders_by_member_id(member_id)
    if not orders:
        return []
    
    result = []
    for order in orders:
        order_dict = {
            "id": order.id,
            "total_price": order.total_price,
            "order_date": order.order_date.isoformat(), # Convert datetime to ISO format string
            "status": order.status.name, # Assuming status is an Enum
            "member_id": order.member_id,
            "order_items": [] # Initialize order_items
        }
        if order.order_items: # Check if order_items exist and iterate
            for order_item in order.order_items:
                order_dict["order_items"].append({
                    "item_id": order_item.item_id,
                    "count": order_item.count,
                    "item_name": order_item.item.name if order_item.item else "Unknown Item" # Include item name
                })
        result.append(order_dict)
    return result



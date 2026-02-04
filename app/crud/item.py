from sqlalchemy.orm import Session

from schemas.dto import ItemBaseModel
from models.item.item import Item
from models.item.book import Book
from models.item.album import Album
from models.item.movie import Movie
from models.category import Category
from models.category_item import CategoryItem
from models.order import Order
from models.order_item import OrderItem
from models.member import Member

class ItemRepository:
    def create(self, db:Session, item:Item):
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def find_by_id(self, db:Session, item_id:int):
        return db.query(Item).filter(Item.id==item_id).first()

    def find_all(self, db:Session):
        return db.query(Item).all()

    def update(self, db:Session, item_id:int, update_content:ItemBaseModel):
        #update_content 는 name, price, stock_quantity, addr1, addr2 이렇게 구성
        updateItem = self.find_by_id(db,item_id)
        if updateItem:
            updateItem.name = update_content.name
            updateItem.stock = update_content.stock
            updateItem.price = update_content.price
            db.commit()
            db.refresh(updateItem)
        return updateItem


    def delete(self, db: Session, item_id: int):
        db_item = self.find_by_id(db, item_id)
        if db_item:
            # 삭제 전에 반환할 데이터 저장
            result = {
                "id": db_item.id,
                "name": db_item.name,
                "price": db_item.price,
                "stock": db_item.stock,
                "type": db_item.type,
            }
            # 타입별 추가 필드
            if hasattr(db_item, 'author') and db_item.author is not None:
                result["author"] = db_item.author
            if hasattr(db_item, 'isbn') and db_item.isbn is not None:
                result["isbn"] = db_item.isbn
            if hasattr(db_item, 'artist') and db_item.artist is not None:
                result["artist"] = db_item.artist
            if hasattr(db_item, 'etc') and db_item.etc is not None:
                result["etc"] = db_item.etc
            if hasattr(db_item, 'director') and db_item.director is not None:
                result["director"] = db_item.director
            if hasattr(db_item, 'actor') and db_item.actor is not None:
                result["actor"] = db_item.actor

            db.delete(db_item)
            db.commit()
            return result
        return None

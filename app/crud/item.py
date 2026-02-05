from sqlalchemy.orm import Session

from crud.category import CategoryRepository
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
cr= CategoryRepository()

class ItemRepository:
    def get_self_and_descendants(self,db:Session, category_id: int):
        temp = [category_id]
        category = cr.find_by_id(db, category_id)
        if category.children is not None:
            for child in category.children:
                temp.extend(self.get_self_and_descendants(db,child.id))
        return temp



    def find_by_category(self, db:Session, category_id:int, item_type:str=None):
        self_and_descendants_ids = self.get_self_and_descendants(db,category_id=category_id)
        query=db.query(Item).join(CategoryItem).filter(
            CategoryItem.category_id.in_(self_and_descendants_ids)
        )
        if item_type:
            query = query.filter(Item.type == item_type)     #카테고리뿐만 아니라 아이템 타입또한 고려해서 거름ㅇㅇ
        return query.all()

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

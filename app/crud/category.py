from sqlalchemy.orm import Session
from models.category import Category


class CategoryRepository:
    def create(self, db:Session, category:Category):
        db.add(category)
        db.commit()
        db.refresh(category)
        return category

    def find_by_name(self, db:Session, category_name:str):
        return db.query(Category).filter(Category.name==category_name).first()

    def find_by_id(self, db:Session, id:int):
        return db.query(Category).filter(Category.id==id).first()

    def find_all(self, db:Session):
        return db.query(Category).all()

    def update(self, db:Session, ca_name:str,name:str, des:str):
        #update_content 는 name, password, zip, addr1, addr2 이렇게 구성
        updateCategory = self.find_by_name(db,ca_name)
        if updateCategory:
            updateCategory.name = name
            updateCategory.description = des
            db.commit()
            db.refresh(updateCategory)
        return updateCategory


    def delete(self, db: Session, category_name: str) -> bool:
        db_category = self.find_by_name(db, category_name)
        if not db_category:
            return False
        db.delete(db_category)
        db.commit()
        return True



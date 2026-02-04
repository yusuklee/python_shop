from sqlalchemy.orm import Session
from models.administrator import Administrator


class AdministratorRepository:
    def create(self, db: Session, admin: Administrator):
        db.add(admin)
        db.commit()
        db.refresh(admin)
        return admin

    def find_by_id(self, db: Session, admin_id: int):
        admin = db.query(Administrator).filter(Administrator.id == admin_id).first()
        return admin

    def find_by_email(self, db: Session, email: str):
        admin = db.query(Administrator).filter(Administrator.email == email).first()
        return admin

    def find_all(self, db: Session):
        return db.query(Administrator).all()

    def update(self, db: Session, admin_id: int, update_content: dict):
        update_admin = self.find_by_id(db, admin_id)
        if update_admin:
            if "name" in update_content.keys():
                update_admin.name = update_content['name']
            if 'password' in update_content.keys():
                update_admin.password = update_content['password']
            if 'email' in update_content.keys():
                update_admin.email = update_content['email']
            db.commit()
            db.refresh(update_admin)
        return update_admin

    def delete(self, db: Session, admin_id: int):
        db_admin = self.find_by_id(db, admin_id)
        if db_admin:
            db.delete(db_admin)
            db.commit()
        return db_admin

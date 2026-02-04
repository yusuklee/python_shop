from sqlalchemy.orm import Session

from crud.administrator import AdministratorRepository
from models.administrator import Administrator

ar = AdministratorRepository()


class AdministratorService:
    def __init__(self, db: Session):
        self.db = db

    def create_admin(self, name: str, email: str, password: str):
        new_admin = Administrator(name=name, email=email, password=password)
        admin = ar.create(self.db, new_admin)
        return admin

    def delete_admin(self, admin_id: int):
        tmp = ar.delete(self.db, admin_id)
        return tmp

    def find_all(self):
        admin_list = ar.find_all(self.db)
        return admin_list

    def find_by_id(self, admin_id: int):
        return ar.find_by_id(self.db, admin_id)

    def find_by_email(self, email: str):
        return ar.find_by_email(self.db, email)

    def update_admin(self, admin_id: int, payload: dict):
        tmp = ar.update(self.db, admin_id, payload)
        return tmp

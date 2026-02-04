from sqlalchemy.orm import Session
from models.member import Member



class MemberRepository:
    def create(self, db:Session, member:Member):
        db.add(member)
        db.commit()
        db.refresh(member)
        return member

    def find_by_id(self, db:Session, member_id:int):
        member=db.query(Member).filter(Member.id==member_id).first()
        return member


    def find_all(self, db:Session):
        return db.query(Member).all()

    def update(self, db:Session, member_id:int, update_content:dict):
        #update_content 는 name, password, zip, addr1, addr2 이렇게 구성
        updateMember = self.find_by_id(db,member_id)
        if updateMember:
            if "name" in update_content.keys():
                updateMember.name = update_content['name']
            if 'password' in update_content.keys():
                updateMember.password = update_content['password']
            if 'zip' in update_content.keys():
                updateMember.zip = update_content['zip']
            if 'addr1' in update_content.keys():
                updateMember.addr1 = update_content['addr1']
            if 'addr2' in update_content.keys():
                updateMember.addr2 = update_content['addr2']
            db.commit()
            db.refresh(updateMember)
        return updateMember


    def delete(self, db: Session, member_id: int) :
        db_member = self.find_by_id(db, member_id)
        if db_member:
            db.delete(db_member)
            db.commit()
        return db_member

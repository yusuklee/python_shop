

from sqlalchemy.orm import Session

from crud.member import MemberRepository
from models.member import Member
from schemas.dto import MemberBaseModel

mr = MemberRepository()
class MemberService:
    def __init__(self, db: Session):
        self.db = db

    def create_member(self, data: MemberBaseModel):
        # 자바의 memberRepository.save() 로직
        new_member = Member(**data.model_dump())
        mb = mr.create(self.db,new_member)  #memberBasemodel
        return mb

    def delete_member(self, member_id):

        tmp = mr.delete(self.db, member_id)
        return tmp

    def find_all(self):
        member_list = mr.find_all(self.db)
        return member_list

    def find_by_id(self, member_id):
        return mr.find_by_id(self.db, member_id)

    def update_member(self, member_id:int, payload:dict):
        tmp = mr.update(self.db, member_id, payload)
        return tmp

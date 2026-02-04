from sqlalchemy import Column, String, ForeignKey,Integer

from models.item.item import Item

class Book(Item):
    __mapper_args__ = {
        "polymorphic_identity":'BOOK'
    }
    author = Column(String(10))
    isbn = Column(Integer)

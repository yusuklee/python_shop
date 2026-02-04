from sqlalchemy import Column, String, ForeignKey

from models.item.item import Item


class Album(Item):
    __mapper_args__={
        'polymorphic_identity':"ALBUM",
    }

    artist = Column(String(100))
    etc = Column(String(255))

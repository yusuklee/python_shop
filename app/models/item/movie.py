from sqlalchemy import Column, String, ForeignKey

from models.item.item import Item


class Movie(Item):
    director = Column(String(50))
    actor = Column(String(50))

    __mapper_args__ = {
        "polymorphic_identity":"MOVIE"
    }

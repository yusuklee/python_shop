from sqlalchemy.orm import Session

from crud.item import ItemRepository
from models.item.album import Album
from models.item.book import Book
from schemas.dto import ItemBaseModel, BookBaseModel, AlbumBaseModel, MovieBaseModel
from models.item.movie import Movie


ir = ItemRepository()

class ItemService:
    def __init__(self,db:Session):
        self.db = db

    def create_book(self,book:BookBaseModel):
        new_book = Book(**book.model_dump(exclude={'id'}))
        temp = ir.create(self.db, new_book)
        return temp

    def create_album(self, album:AlbumBaseModel):
        album = Album(**album.model_dump(exclude={'id'}))
        temp = ir.create(self.db,album)
        return temp

    def create_movie(self, movie:MovieBaseModel):
        movie = Movie(**movie.model_dump(exclude={'id'}))
        temp = ir.create(self.db,movie)
        return temp

    def read_item_by_id(self, id:int):
        by_id = ir.find_by_id(self.db,id)
        return by_id
    
    def read_all(self):
        return ir.find_all(self.db)

    def update_item(self, id:int, payload:ItemBaseModel):
        update = ir.update(self.db, id, payload)
        return update

    def delete_item(self, id:int):
        delete = ir.delete(self.db, id)
        return delete

    def read_by_category(self, category_id: int, item_type: str = None):
        return ir.find_by_category(self.db, category_id, item_type)



from sphinx.util.cfamily import NoOldIdError

from crud.category import CategoryRepository
from crud.item import ItemRepository
from models.category import Category
from models.category_item import CategoryItem

cr = CategoryRepository()
ir = ItemRepository()





# id     name        description       parent_id       category_items
class CategoryService:
    def __init__(self,db):
        self.db=db

    def createCategory(self,name:str, description:str):
        category = Category(name=name, description=description)
        create = cr.create(self.db, category=category)
        return create


    def show_category(self, id:int):
        by_id = cr.find_by_id(self.db, id)
        return by_id

    def add_child(self, ca_name:str, child_name:str):
        category = cr.find_by_name(self.db,ca_name)
        child = cr.find_by_name(self.db, child_name)
        if category is None or child is None:
            return None

        child.add_parent(category)
        self.db.add(category)
        self.db.commit()
        return category

    def add_parent(self,ca_name:str, parent_name:str):
        category = cr.find_by_name(self.db, ca_name)
        parent = cr.find_by_name(self.db, parent_name)
        if category is None or parent is None:
            return None

        category.add_parent(parent)
        self.db.add(category)
        self.db.commit()
        return category

    def connect_category_item(self, item_id:int, ca_name:str):
        item=ir.find_by_id(self.db,item_id)
        category = cr.find_by_name(self.db,ca_name)
        if item is None or category is None:
            return False

        category_item = CategoryItem.createCategoryItem(item=item, category=category)
        self.db.add(category_item)
        self.db.add(category)
        self.db.commit()

        return True

    def remove_category(self, ca_name:str):
        delete = cr.delete(self.db, ca_name)
        return delete

    def update_category(self, ca_name:str, name:str, des:str):
        category= cr.update(self.db, ca_name=ca_name,name=name, des=des)
        return category

    def get_all_categories(self):
        return cr.find_all_root(self.db)

    def get_all_categories_flat(self):
        return cr.find_all(self.db)

    def search_categories(self, keyword: str):
        return cr.search_by_name(self.db, keyword)

    def get_categories_by_item(self, item_id: int):
        from models.category_item import CategoryItem
        category_items = self.db.query(CategoryItem).filter(CategoryItem.item_id == item_id).all()
        return [ci.category for ci in category_items]

    def disconnect_category_item(self, item_id: int, ca_name: str):
        from models.category_item import CategoryItem
        category = cr.find_by_name(self.db, ca_name)
        if category is None:
            return False
        category_item = self.db.query(CategoryItem).filter(
            CategoryItem.item_id == item_id,
            CategoryItem.category_id == category.id
        ).first()
        if category_item is None:
            return False
        self.db.delete(category_item)
        self.db.commit()
        return True


        





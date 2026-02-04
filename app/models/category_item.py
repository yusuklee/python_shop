from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from db.session import Base

class CategoryItem(Base):
    __tablename__ = "category_items"

    id = Column(Integer, primary_key=True, index=True)

    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    category_id = Column(Integer,ForeignKey("categories.id"), nullable=False)

    item = relationship(
        "Item",
        back_populates="category_items"
    )
    category = relationship(
        "Category",
        back_populates='category_items'
    )



    @classmethod
    def createCategoryItem(cls, item, category):
        category_item = cls()
        category_item.item = item
        category_item.category = category
        return category_item

    

    

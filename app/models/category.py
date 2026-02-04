from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, backref
from db.session import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)                #카테고리 처음 만들떄는 name과 description만
    name = Column(String(50), nullable=False)
    description = Column(String(255))
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    category_items = relationship("CategoryItem", back_populates="category")

    parent = relationship(
        'Category',
        remote_side=[id],
        back_populates='children'
    )

    children = relationship(        #자식은 여러개라 id로 저장 x
        "Category",
        back_populates='parent'
    )


    def has_ancestor(self, category:"Category"):
        current = self.parent
        while current is not None:
            if current==category:
                return True
            current = current.parent
        return False

    def add_child(self, child:"Category"):
        if self == child:
            raise ValueError("you can't select yourself to child")
        if self.has_ancestor(child):
            raise ValueError("circular structure occurred")

        self.children.append(child)

    def add_parent(self, parent:"Category"):
        if self ==parent:
            raise ValueError("자기 자신을 부모로 선택할수 없습니다.")
        if parent.has_ancestor(self):
            raise ValueError("순환 구조 발생!")
        self.parent= parent



"""
Database initialization script.
Run this to update the database schema.
"""
from sqlalchemy import text
from db.session import engine, Base

# Import all models so Base knows about them
from models.member import Member
from models.order import Order
from models.delivery import Delivery
from models.order_item import OrderItem
from models.category import Category
from models.category_item import CategoryItem
from models.item.item import Item
from models.item.book import Book
from models.item.album import Album
from models.item.movie import Movie
from models.administrator import Administrator


def init_db():
    """Initialize database - create all tables"""
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully!")


def add_email_column():
    """Add email column to members table if it doesn't exist"""
    with engine.connect() as conn:
        # Check if email column exists
        result = conn.execute(text("""
            SELECT COUNT(*)
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = 'python_shop'
            AND TABLE_NAME = 'members'
            AND COLUMN_NAME = 'email'
        """))
        exists = result.scalar()

        if not exists:
            conn.execute(text("ALTER TABLE members ADD COLUMN email VARCHAR(50) AFTER name"))
            conn.commit()
            print("Email column added to members table!")
        else:
            print("Email column already exists.")


def create_default_admin():
    """Create default admin account if not exists"""
    import bcrypt
    from sqlalchemy.orm import Session
    from db.session import SessionLocal

    db = SessionLocal()
    try:
        # Delete all existing admins and create fresh
        db.query(Administrator).delete()
        db.commit()

        hashed_password = bcrypt.hashpw("admin".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        new_admin = Administrator(
            name="관리자",
            email="admin@naver.com",
            password=hashed_password
        )
        db.add(new_admin)
        db.commit()
        print("Default admin account created! (admin@naver.com / admin)")
    finally:
        db.close()


if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    add_email_column()
    create_default_admin()
    print("Database initialization complete!")

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from db.session import get_db
from main import app


@pytest.fixture
def db_session():
    db_url = "mysql+pymysql://root:root1234@localhost:3306/python_shop"
    engine = create_engine(db_url)
    connection = engine.connect()
    transaction = connection.begin()

    app.dependency_overrides[get_db] = lambda: session

    Session = sessionmaker(bind=connection)
    session = Session()
    yield session  

    session.close()
    transaction.rollback()
    connection.close()
    app.dependency_overrides.clear()

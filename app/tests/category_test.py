import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from main import app

client = TestClient(app)



## 1. 카테고리 생성 (POST)
def test_create_category(db_session):
    payload = {
        "name":"부모1",
        "des":"설명1"
    }
    response = client.post("/category/create",json=payload)
    assert response.status_code==200
    assert response.json()['name']=="부모1"


## 2. 자식 추가 (PATCH)
def test_add_child(db_session):
    payload = {
        "ca_name":"카테고리1",
        "child_name":"자식1"
    }
    response = client.patch("/category/add_child", json=payload)
    assert response.status_code==200


## 3. 부모 추가 (PATCH)
def test_add_parent(db_session):
    payload = {
        "ca_name": "카테고리1",
        "parent_name": "부모1"
    }
    response = client.patch("/category/add_parent", json=payload)
    assert response.status_code == 200


## 4. 아이템-카테고리 연결 (POST, Boolean 리턴)
def test_connect_ca_it(db_session):
    payload = {
        "ca_name":"카테고리1",
        "item_id":"1"
    }
    response = client.patch("/category/connect", json=payload)

    assert response.status_code==200
    assert response.json()==True



## 5. 카테고리 삭제 (DELETE)
def test_remove_category(db_session):
    removed_data = client.delete("/category/delete/카테고리1")
    assert removed_data.status_code==200
    assert removed_data.json()==True
    


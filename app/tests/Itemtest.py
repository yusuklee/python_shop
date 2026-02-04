
from fastapi.testclient import TestClient
from main import app  # FastAPI 인스턴스가 있는 파일

client = TestClient(app)

# 공통 데이터 정의
BOOK_PAYLOAD = {
    "name": "FastAPI 실전",
    "price": 25000,
    "stock": 10,
    "author": "Gemini",
    "isbn": 123
}

ALBUM_PAYLOAD = {
    "name": "Butter",
    "price": 18000,
    "stock": 50,
    "artist": "BTS",
    "etc":"기타 등등"
}


### --- 생성(Create) 테스트 --- ###

def test_create_book(db_session):
    response = client.post("/item/create/book", json=BOOK_PAYLOAD)
    assert response.status_code == 200
    assert response.json()["name"] == BOOK_PAYLOAD["name"]
    assert response.json()["author"] == "Gemini"


def test_create_album(db_session):
    response = client.post("/item/create/album", json=ALBUM_PAYLOAD)
    assert response.status_code == 200
    assert response.json()["artist"] == "BTS"




def test_read_all_items(db_session):

    response = client.get("/item/show/all")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_read_item_by_id(db_session):
    response = client.get(f"/item/show/1")
    assert response.status_code == 200
    assert response.json()["price"] == 25000

    response2 = client.get("/item/show/99999")
    assert response2.status_code == 404
    assert response2.json()["detail"] == "상품이 존재하지 않습니다."



def test_update_item(db_session):


    update_data = {
        "name": "수정된 책이름",
        "price": 30000,
        "stock": 5
    }

    response = client.patch("/item/update/1", json=update_data)
    assert response.status_code == 200
    assert response.json()["name"] == "수정된 책이름"

    res2 = client.patch("/item/update/1000", json=update_data)
    assert res2.status_code==404




def test_delete_item(db_session):


    response = client.delete("/item/delete/1")
    assert response.status_code == 200
    assert response.json()['name']=='FastAPI 실전'

    # 다시 조회했을 때 404가 나와야 함
    get_res = client.get("/item/show/1")
    assert get_res.status_code == 404

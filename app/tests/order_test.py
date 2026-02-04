from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_create_order_success(db_session):
    # 1. 사전 데이터 준비 (Member, Item)


    # 2. API 호출 데이터 (DTO 형태)
    order_data = {
        "zip": "12345",
        "addr1": "서울시",
        "addr2": "강남구",
        "items": [
            {"item_id": 1, "count": 2}
        ]
    }

    order_data2 = {
        "zip": "12345",
        "addr1": "서울시",
        "addr2": "강남구",
        "items": [
            {"item_id": 1, "count": 100}
        ]
    }

    # 3. API 호출
    response = client.post(f"/order/create/1", json=order_data)

    # 4. 검증
    assert response.status_code == 200
    data = response.json()
    assert data["total_price"] == 50000

    res2 = client.get("/item/show/1")
    assert res2.json()['stock']==88

    # response3 = client.post(f"/order/create/1", json=order_data2)
    # assert response3.status_code==404
    # assert response3.json()['detail'] =="주문이 취소 되었습니다."







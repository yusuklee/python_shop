from main import app
from fastapi.testclient import TestClient

client = TestClient(app)


# 1. 회원 생성 테스트

def test_create_member(db_session):
    # Given (자바의 CreateMemberDto 데이터 준비)
    payload = {
        "name": "이유석",
        "addr1": "첫번쨰 주소",
        "addr2": "두번쨰 주소",
        "zip": "알빠노",
        "password": "oensang166"
    }


    response = client.post("/member/create", json=payload)


    assert response.status_code ==200
    assert response.json()=={
        "name": "이유석",
        "addr1": "첫번쨰 주소",
        "addr2": "두번쨰 주소",
        "zip": "알빠노",
        "password": "oensang166"
    }


# 2. 회원 목록 조회 테스트
def test_show_members(db_session):
    # When (GET 요청)
    response = client.get("/member/show/all")

    # Then
    assert response.status_code == 200
    assert isinstance(response.json(), list)  # 응답이 리스트인지 확인



def test_delete_member(db_session):
    response = client.delete("/member/delete/1")

    assert response.status_code==200
    assert response.json()=={
        "name": "이유석",
        "addr1": "첫번쨰 주소",
        "addr2": "두번쨰 주소",
        "zip": "알빠노",
        "password": "oensang166"
    }

def test_wrong_delete_member(db_session):
    response = client.delete("/member/delete/100")

    assert response.status_code==404
    assert response.json()['detail'] == "회원이 존재하지 않습니다."


def test_update_member(db_session):
    payload = {
        "name": "엄준식",
    }
    response = client.patch("/member/update/1", json=payload)

    assert response.status_code==200
    assert response.json() == {
        "name": "엄준식",
        "addr1": "첫번쨰 주소",
        "addr2": "두번쨰 주소",
        "zip": "알빠노",
        "password": "oensang166"
    }




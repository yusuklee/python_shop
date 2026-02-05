from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from api.member_api import router as memberRouter
from api.item_api import router as itemRouter
from api.order_api import router as orderRouter
from api.category_api import router as CategoryRouter
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(memberRouter)
app.include_router(itemRouter)
app.include_router(orderRouter)
app.include_router(CategoryRouter)

@app.get("/")
def root():
    return {"message": "Hello World"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


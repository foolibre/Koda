from fastapi import FastAPI

app = FastAPI(title="{{PROJECT_NAME}} API")


@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI"}
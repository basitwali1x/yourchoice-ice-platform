from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, routes, orders, reports, customers, locations, products, work_orders, integrations, deployments, logistics, distribution_centers, driver
from database import engine
import models

# Ensure tables exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="YCI (Your Choice Ice) API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register All Routers
app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(locations.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(routes.router)
app.include_router(work_orders.router)
app.include_router(reports.router)
app.include_router(integrations.router)
app.include_router(deployments.router)
app.include_router(logistics.router)
app.include_router(distribution_centers.router)
app.include_router(driver.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to YCI (YOUR CHOICE ICE) API",
        "docs_url": "/docs",
        "status": "operational"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

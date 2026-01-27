from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, routes, orders, reports, customers, locations, products, work_orders, integrations, deployments, logistics, distribution_centers, driver, users
from database import engine
import models
from fastapi.staticfiles import StaticFiles
import os

# Create uploads dir if not exists (relative to backend/)
UPLOAD_DIR = "data/uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Ensure tables exist
try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Metadata table creation failed: {e}")

app = FastAPI(title="YCI (Your Choice Ice) API", version="1.0.0")

# Mount static files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

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
app.include_router(users.router)
# from routers import ..., optimization
# ...
# app.include_router(optimization.router)

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

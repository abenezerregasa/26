from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy import create_engine, Column, Integer, String, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
import requests

# Database configuration
DATABASE_URL = "mysql+pymysql://root:abenezer%40BNO2024@localhost/template_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Template table model
class TemplateURL(Base):
    __tablename__ = "template_urls"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    type = Column(Enum('smartphone', 'rectangular', 'square'), nullable=False)

# Create the database tables (if they don't exist)
Base.metadata.create_all(bind=engine)

# FastAPI app initialization
app = FastAPI()

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests from React frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Serve static files (if images are stored locally)
app.mount("/static", StaticFiles(directory="templates"), name="static")

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API to fetch templates by type (smartphone, rectangular, square)
@app.get("/templates/{template_type}")
def get_templates(template_type: str, db=Depends(get_db)):
    templates = db.query(TemplateURL).filter(TemplateURL.type == template_type).all()
    if not templates:
        raise HTTPException(status_code=404, detail="No templates found for this category")
    return templates

# Proxy external images through this endpoint
@app.get("/fetch-image/")
def fetch_image(url: str):
    """
    Fetch an image from an external URL and stream it to the client.
    """
    try:
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            return StreamingResponse(response.raw, media_type="image/png")
        else:
            raise HTTPException(status_code=404, detail="Image not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching image")

# Placeholder for PDF generation (not modified in this update)
@app.post("/generate-pdf/")
def generate_pdf(template_data: dict):
    pass  # Assume this endpoint is working correctly for exporting PDFs



@app.post("/save-default-positions")
def save_default_positions(data: dict, db=Depends(get_db)):
    """
    Save the updated default positions to the database.
    """
    template_id = data["templateId"]
    fields = data["fields"]

    # Update database logic here (assume a field_positions table exists)
    for field in fields:
        # Example logic: Save `field["x"]` and `field["y"]` for `field["name"]`
        pass

    return {"message": "Default positions updated successfully"}

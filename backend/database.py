import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "ai_website_generator")

client = AsyncIOMotorClient(MONGODB_URL)
database = client[MONGODB_DB_NAME]

def get_database():
    return database

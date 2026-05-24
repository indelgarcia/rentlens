import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
NYC_OPEN_DATA_APP_TOKEN: str = os.getenv("NYC_OPEN_DATA_APP_TOKEN", "")

supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client


# Load backend/.env explicitly
ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ENV_PATH)


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    """
    Create and cache the server-side Supabase client.

    The secret key must remain backend-only.
    """

    supabase_url = os.getenv("SUPABASE_URL")
    supabase_secret_key = os.getenv("SUPABASE_SECRET_KEY")

    if not supabase_url:
        raise RuntimeError(
            "SUPABASE_URL is missing. Add it to backend/.env."
        )

    if not supabase_secret_key:
        raise RuntimeError(
            "SUPABASE_SECRET_KEY is missing. Add it to backend/.env."
        )

    return create_client(
        supabase_url,
        supabase_secret_key,
    )
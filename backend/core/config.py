import os
from pathlib import Path

from dotenv import load_dotenv


# =========================================================
# ENVIRONMENT
# =========================================================

ENV_PATH = (
    Path(__file__).resolve().parents[1]
    / ".env"
)

load_dotenv(ENV_PATH)


# =========================================================
# RECOVERAI SAFETY CONFIGURATION
# =========================================================

MAX_RETRIES = 2

MIN_CONFIDENCE_AUTO_EXECUTE = 0.80

MIN_CONFIDENCE_ANY_ACTION = 0.50

RETRY_COOLDOWN_MINUTES = 15

DUPLICATE_WINDOW_SECONDS = 30

MAX_RECOVERABLE_AMOUNT_AUTO = 50_000

STOP_ON_CONSECUTIVE_FAILURES = 2


# =========================================================
# AI REASONING CONFIGURATION
# =========================================================

AI_ENABLED = (
    os.getenv(
        "RECOVERAI_AI_ENABLED",
        "false",
    )
    .strip()
    .lower()
    in {
        "1",
        "true",
        "yes",
        "on",
    }
)

AI_PROVIDER = os.getenv(
    "AI_PROVIDER",
    "gemini",
).strip().lower()

AI_MODEL = os.getenv(
    "AI_MODEL",
    "gemini-3.7-flash",
).strip()

AI_TIMEOUT_SECONDS = float(
    os.getenv(
        "AI_TIMEOUT_SECONDS",
        "8",
    )
)

AI_MAX_RETRIES = int(
    os.getenv(
        "AI_MAX_RETRIES",
        "1",
    )
)
import logging
import os
from pathlib import Path

# Ensure logs directory exists
LOGS_DIR = Path(__file__).resolve().parent.parent.parent / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)
LOG_FILE = LOGS_DIR / "backend.log"

LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"


def setup_logging() -> logging.Logger:
    """Configure and return the root logger for the application."""
    logger = logging.getLogger("c3_pos")
    logger.setLevel(logging.INFO)

    # Avoid duplicate handlers if already configured
    if not logger.handlers:
        # File handler
        file_handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
        file_handler.setFormatter(logging.Formatter(LOG_FORMAT))
        file_handler.setLevel(logging.INFO)
        logger.addHandler(file_handler)

        # Stream (Console) handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(logging.Formatter(LOG_FORMAT))
        console_handler.setLevel(logging.INFO)
        logger.addHandler(console_handler)

    return logger


logger = setup_logging()

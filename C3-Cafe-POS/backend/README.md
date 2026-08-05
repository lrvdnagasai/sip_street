# C³ Cafe POS - Backend Foundation

FastAPI backend application for the C³ Cafe POS System.

---

## Architecture

```
backend/
├── app/
│   ├── api/          # API Routers
│   ├── core/         # Core utilities (logging, security, etc.)
│   ├── database/     # Database engine, session, Base & initialization
│   │   ├── connection.py  # SQLAlchemy engine & DB connection health check
│   │   ├── session.py     # SessionLocal factory
│   │   ├── base.py        # DeclarativeBase class
│   │   └── init_db.py     # Database schema startup initialization
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # Business logic
│   ├── utils/        # General utilities
│   ├── config.py     # Configuration management (pydantic-settings)
│   ├── dependencies.py # API dependencies (get_db)
│   └── main.py       # FastAPI application entry point
├── migrations/       # Alembic database migrations environment
├── alembic.ini       # Alembic configuration file
├── database/         # Local SQLite database file location (c3_pos.db)
├── logs/             # Application logs
├── tests/            # Automated test suite
├── .env              # Environment variables
├── .gitignore        # Git ignore rules
├── README.md         # Backend documentation
└── requirements.txt  # Python package dependencies
```

---

## Setup & Virtual Environment

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create a Python virtual environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows (CMD)**:
     ```cmd
     .\venv\Scripts\activate.bat
     ```
   - **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

---

## Database & Configuration

Environment variables are defined in `.env`:

```env
APP_NAME=C3 Cafe POS
APP_VERSION=1.0.0
DEBUG=True
DATABASE_URL=sqlite:///./database/c3_pos.db
```

### Database Initialization
- The application automatically initializes the SQLite database file at `backend/database/c3_pos.db` on application startup during the FastAPI lifespan event.
- Database connectivity can be verified via the `/health` endpoint.

### Alembic Migrations
Alembic is configured for future schema changes:
- `alembic.ini` points to SQLite at `database/c3_pos.db`.
- `migrations/env.py` dynamically loads configuration and imports `Base.metadata`.
- To create future migration revisions (when models are added):
  ```bash
  alembic revision --autogenerate -m "Migration description"
  ```
- To apply future migrations:
  ```bash
  alembic upgrade head
  ```

---

## Running the Application

### Development Server (Uvicorn)

Run Uvicorn directly from the `backend` directory:

```bash
uvicorn app.main:app --reload --port 8000
```

Or run using python:

```bash
python main.py
```

### Endpoints & Interactive Documentation

- **Root**: [http://localhost:8000/](http://localhost:8000/)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
  - Returns: `{"status": "Healthy", "database": "Connected"}`
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Running Tests

Run pytest from the `backend` directory:

```bash
pytest
```

Or run pytest with verbose output:

```bash
pytest -v
```

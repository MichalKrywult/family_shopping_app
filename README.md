# Modular Shopping List API

A modern, production-ready backend for a shopping list application. The project is designed using a **Vertical Feature Architecture**, enabling easy scalability and seamless addition of new modules (e.g., user authentication, notifications).

## 🚀 Technologies

* **Python**
* **FastAPI** – asynchronous web framework
* **SQLModel** – modern ORM combining the capabilities of SQLAlchemy and Pydantic
* **SQLite** – relational database
* **Git** – version control

## 🏗️ Project Architecture

The project follows a **Vertical Feature Architecture** approach. Each business module (e.g., `shopping`) contains its own database models, business logic (service), and API endpoints (router), minimizing dependencies between system components.

### Server-side project structure with a single feature slice (`shopping`)

```text
server/
├── data/                  # Local database (ignored by Git)
└── app/
    ├── main.py            # Application entry point
    ├── core/              # Global configuration (database setup)
    └── shopping/          # Shopping lists and items management module
        ├── models.py      # Database table definitions using SQLModel
        ├── service.py     # Business logic and database operations
        └── router.py      # FastAPI API endpoints
```

## 🛠️ Features

* Create multiple independent shopping lists.
* Add items to specific shopping lists with a defined quantity.
* Mark items as purchased (`is_done`).
* Soft Delete mechanism for shopping lists – lists are not permanently removed from the database, preserving historical data consistency.
* Data security through Pydantic validation and parameterized SQL queries (protection against SQL Injection).

## 💻 Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/MichalKrywult/family_shopping_app
cd list-zakupowa-backend
```

### 2. Create and activate a virtual environment

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate
``` 

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the development server

```bash
uvicorn app.main:app --reload
```

### 5. Open the interactive API documentation

👉 http://127.0.0.1:8000/docs
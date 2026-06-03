# Modular Shopping List API

A modern, production-ready backend for a shopping list application. The project is built using a **Vertical Feature Architecture**, making it easy to scale and extend with additional modules such as authentication, notifications, or user management.

## 🚀 Technologies

* **Python**
* **FastAPI** — asynchronous web framework
* **SQLModel** — modern ORM combining the power of SQLAlchemy and Pydantic
* **SQLite** — lightweight relational database
* **Docker & Docker Compose** — containerized deployment
* **Git** — version control

---

## 🏗️ Architecture

The application follows a **Vertical Feature Architecture** approach. Each feature contains its own models, business logic, and API endpoints, minimizing coupling between modules and improving maintainability.

### Project Structure

```text
server/
├── data/                  # Local database (ignored by Git)
└── app/
    ├── main.py            # Application entry point
    ├── core/              # Global configuration (database, environment variables)
    ├── auth/              # Authentication module (JWT, registration, login)
    │   ├── models.py
    │   ├── service.py
    │   └── router.py
    └── shopping/          # Shopping lists and items management
        ├── models.py
        ├── service.py
        └── router.py
```

---

## ✨ Features

* User registration and authentication using OAuth2 and JWT tokens
* Secure password hashing with bcrypt
* Multiple shopping lists assigned to individual users
* Adding items with custom quantities
* Marking items as purchased (`is_done`)
* Soft Delete mechanism for shopping lists
* Input validation using Pydantic
* Protection against common security threats such as SQL Injection
* Modular architecture designed for future expansion

---

## ⚙️ Environment Variables

Before starting the application, create a `.env` file inside the `server/` directory based on `.env.example`.

```env
SECRET_KEY="your-super-secret-key-for-jwt"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_DAYS=30
```

---

# 🐳 Running with Docker (Recommended)

## 1. Configure Environment Variables

Create the required `.env` file inside the `server/` directory.

## 2. Build and Start the Application

```bash
docker compose up -d --build
```

This command will:

* Build the Docker image from `server/Dockerfile`
* Start the `shopping-app` service in the background
* Expose the API on port **8000**
* Mount local volumes for persistent data storage
* Load environment variables from the `.env` file
* Automatically restart the container if it stops

## 3. Verify the Container Status

```bash
docker ps --filter "name=shopping_list_container"
```

## 4. Open API Documentation

```text
http://127.0.0.1:8000/docs
```

---

# 💻 Running Locally (Development Mode)

## 1. Clone the Repository

```bash
git clone https://github.com/MichalKrywult/family_shopping_app.git
cd family_shopping_app
```

## 2. Create and Activate a Virtual Environment

```bash
python -m venv .venv
```

### Windows

```bash
.venv\Scripts\activate
```

### macOS / Linux

```bash
source .venv/bin/activate
```

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## 4. Configure Environment Variables

Create the `.env` file inside the `server/` directory.

## 5. Run the Development Server

```bash
uvicorn app.main:app --reload
```

## 6. Open API Documentation

```text
http://127.0.0.1:8000/docs
```

---

# 🚀 Deployment

To deploy a new version after making changes:

```bash
docker compose up -d --build
```

Docker Compose will automatically:

* Stop the old container
* Rebuild the image
* Start the updated version
* Preserve the database stored in `./server/data`

---

## 📖 API Documentation

Once the application is running, interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

Additional OpenAPI schema:

```text
http://127.0.0.1:8000/openapi.json
```

---

## 🔒 Security

The application includes several security mechanisms:

* JWT-based authentication
* Password hashing using bcrypt
* Request validation via Pydantic
* Environment-based secret management
* Soft Delete strategy for preserving data integrity
* SQLModel/SQLAlchemy ORM protection against SQL Injection

---

## 📄 License

This project is available under the MIT License.

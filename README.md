# Inventory & Order Management System

A full-stack application to manage **products**, **customers**, and **orders**.

- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic, Alembic
- **Database:** SQLite for local development, PostgreSQL for Docker/production
- **Frontend:** React + Vite (built in a later step)
- **Containerization:** Docker + docker-compose (frontend, backend, postgres)

---

## Features

- **Products:** create, list, get, update, delete. Fields: `name`, `sku` (unique), `price`, `quantity_in_stock`.
- **Customers:** create, list, get, delete. Fields: `full_name`, `email` (unique), `phone`.
- **Orders:** create, list, get, delete. An order has a customer, one or more products with quantities, and an auto-calculated total.

### Business rules enforced
- `sku` and `email` must be unique (returns **409 Conflict** on duplicates).
- Stock can never go negative (database-level check + validation).
- Orders are rejected with **409** if stock is insufficient.
- Creating an order **automatically reduces** stock.
- Deleting an order **restores** the stock it had used.
- The backend **calculates the order total** automatically.
- Proper validation (**422** for bad input) and **404** for missing records.

---

## Run the backend locally (no Docker needed)

The backend defaults to a local **SQLite** file, so you can run it immediately.

```bash
cd backend

# 1. Create a virtual environment (once)
python -m venv .venv

# 2. Activate it
#    Windows (Git Bash):
source .venv/Scripts/activate
#    Windows (PowerShell):
#    .venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install -r requirements.txt
#    If your network blocks pip with an SSL error, add:
#    pip install -r requirements.txt --trusted-host pypi.org --trusted-host files.pythonhosted.org

# 4. Start the server
uvicorn app.main:app --reload
```

Then open the interactive API docs:

- **http://localhost:8000/docs** — click any endpoint, "Try it out", and run real requests.
- http://localhost:8000/ — health check.

The database file `backend/inventory.db` is created automatically on first run.

---

## Run the frontend locally

The frontend is a React + Vite app in `frontend/`. Run it **alongside** the
backend (keep the backend running in another terminal).

```bash
cd frontend

# 1. Install dependencies (once)
npm install
#    If your network blocks npm with a certificate error
#    (UNABLE_TO_VERIFY_LEAF_SIGNATURE), trust the system cert store:
#    NODE_OPTIONS=--use-system-ca npm install

# 2. Start the dev server
npm run dev
```

Then open **http://localhost:5173** in your browser.

The frontend reads the backend URL from `frontend/.env` (`VITE_API_URL`,
default `http://localhost:8000`). Change it there for deployment.

### Screens
- **Dashboard** — totals for products, customers, orders + low-stock list.
- **Products** — table with add / edit / delete.
- **Customers** — table with add / delete.
- **Orders** — list, view details, and create an order (pick a customer, add
  products with quantities, see the total calculated live).

---

## Configuration

The backend reads one environment variable:

| Variable        | Default                      | Purpose                                  |
|-----------------|------------------------------|------------------------------------------|
| `DATABASE_URL`  | `sqlite:///./inventory.db`   | Which database to use.                    |

- **Local:** leave it unset → SQLite file.
- **Docker/Postgres:** `postgresql+psycopg2://user:pass@host:5432/dbname`

Copy `.env.example` to `.env` to customize. See that file for all options.

---

## Database migrations (Alembic)

For local development the tables are created automatically on startup, so you
don't need this. For PostgreSQL/production, use Alembic:

```bash
cd backend
# Generate a migration from the models
alembic revision --autogenerate -m "initial schema"
# Apply it
alembic upgrade head
```

---

## Run with Docker (later — Docker not installed yet)

Once Docker Desktop is installed:

```bash
docker compose up --build
```

This starts three services:
- **postgres** — the database (port 5432)
- **backend** — the API (http://localhost:8000)
- **frontend** — the React app (http://localhost:5173)

---

## Project structure

```
inventory-order-system/
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/                 # database migrations
│   └── app/
│       ├── main.py              # app entry point + /docs
│       ├── database.py          # DB connection (SQLite or Postgres)
│       ├── models.py            # database tables
│       ├── schemas.py           # request/response validation
│       ├── crud.py              # business logic
│       └── routers/             # API endpoints
└── frontend/                    # React app (built later)
```

---

## API summary

| Method | Path                  | Description                          |
|--------|-----------------------|--------------------------------------|
| GET    | `/`                   | Health check                         |
| POST   | `/products`           | Create a product                     |
| GET    | `/products`           | List products                        |
| GET    | `/products/{id}`      | Get one product                      |
| PUT    | `/products/{id}`      | Update a product                     |
| DELETE | `/products/{id}`      | Delete a product                     |
| POST   | `/customers`          | Create a customer                    |
| GET    | `/customers`          | List customers                       |
| GET    | `/customers/{id}`     | Get one customer                     |
| DELETE | `/customers/{id}`     | Delete a customer                    |
| POST   | `/orders`             | Create an order (checks stock, computes total) |
| GET    | `/orders`             | List orders                          |
| GET    | `/orders/{id}`        | Get one order                        |
| DELETE | `/orders/{id}`        | Delete an order (restores stock)     |

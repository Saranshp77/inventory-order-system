# Inventory & Order Management System

A full-stack web application for managing products, customers, and orders, with a
dashboard, inventory tracking, and automatic order processing. Built with a
FastAPI backend, a React (Vite) frontend, and PostgreSQL, fully containerized
with Docker and deployed to the cloud.

## 🔗 Live Links

| Resource | URL |
| --- | --- |
| **Live frontend** | https://inventory-order-system-ruddy.vercel.app |
| **Live backend API** | https://inventory-backend-rflh.onrender.com |
| **API docs (Swagger UI)** | https://inventory-backend-rflh.onrender.com/docs |
| **GitHub repository** | https://github.com/Saranshp77/inventory-order-system |
| **Docker Hub image (backend)** | https://hub.docker.com/r/saransh777/inventory-backend |

> ℹ️ The backend runs on Render's free tier, which sleeps after inactivity. The
> first request after an idle period may take 30–60 seconds to wake the service.

---

## 🧰 Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy ORM, Pydantic, Alembic
- **Frontend:** React, Vite, React Router, Axios
- **Database:** PostgreSQL (production / Docker), SQLite (local default)
- **Containerization:** Docker, Docker Compose
- **Deployment:** Backend on **Render**, frontend on **Vercel**, backend image on **Docker Hub** (built & pushed via **GitHub Actions**)

---

## ✨ Key Features

- **Product management** — create, view, update, and delete products (name, SKU, price, stock).
- **Customer management** — create, view, and delete customers (name, email, phone).
- **Order management** — create orders with multiple line items, view order details, and delete orders.
- **Dashboard** — at-a-glance totals for products, customers, and orders, plus a **low-stock** watchlist.
- **Business rules enforced by the backend:**
  - **Unique SKU and email** — duplicates are rejected.
  - **Stock can never go negative**, and an order is **rejected if stock is insufficient**.
  - **Automatic stock reduction** when an order is placed (and stock is restored if the order is deleted).
  - **Automatic order-total calculation** on the server.
  - **Low-stock tracking** surfaced on the dashboard.
- **Polished dark UI** — a professional, responsive SaaS-style interface with clear validation and success/error messages.

---

## 🚀 Run Locally with Docker Compose

The easiest way to run the entire stack (frontend + backend + PostgreSQL) is with
Docker Compose.

### Prerequisites
- [Docker](https://www.docker.com/) and Docker Compose installed.

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Saranshp77/inventory-order-system.git
cd inventory-order-system

# 2. (Optional) create a .env file from the template
cp .env.example .env

# 3. Build and start all three services
docker compose up --build
```

Then open:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API docs:** http://localhost:8000/docs

To stop the stack:

```bash
docker compose down          # stop containers
docker compose down -v       # stop and also remove the database volume
```

### Environment variables

All variables have sensible defaults, so `docker compose up` works out of the box.

| Variable | Used by | Default | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | backend | SQLite locally; PostgreSQL in Compose | Database connection string. `postgres://` URLs are auto-normalized to `postgresql://`. |
| `ALLOWED_ORIGINS` | backend | deployed frontend + `http://localhost:5173` | Comma-separated list of origins allowed to call the API (CORS). |
| `PORT` | backend | `8000` | Port the API listens on (set automatically by Render). |
| `POSTGRES_USER` | postgres | `postgres` | Database user. |
| `POSTGRES_PASSWORD` | postgres | `postgres` | Database password. |
| `POSTGRES_DB` | postgres | `inventory` | Database name. |
| `VITE_API_URL` | frontend | `http://localhost:8000` | Base URL the frontend uses to reach the backend. |

---

## 🖥️ Run Without Docker (local development)

<details>
<summary>Backend (FastAPI)</summary>

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate      # Windows (Git Bash); use source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend defaults to a local SQLite file, so no database setup is required.
Visit http://localhost:8000/docs.
</details>

<details>
<summary>Frontend (React + Vite)</summary>

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173. The API base URL is read from `VITE_API_URL`
(defaults to `http://localhost:8000`).
</details>

---

## 📡 API Overview

Interactive documentation is available at **`/docs`** (Swagger UI). All request
and response bodies are JSON.

### Products
| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/products` | Create a product |
| `GET` | `/products` | List all products |
| `GET` | `/products/{id}` | Get a single product |
| `PUT` | `/products/{id}` | Update a product |
| `DELETE` | `/products/{id}` | Delete a product |

### Customers
| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/customers` | Create a customer |
| `GET` | `/customers` | List all customers |
| `GET` | `/customers/{id}` | Get a single customer |
| `DELETE` | `/customers/{id}` | Delete a customer |

### Orders
| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/orders` | Create an order (validates stock, reduces stock, computes total) |
| `GET` | `/orders` | List all orders |
| `GET` | `/orders/{id}` | Get a single order with line items |
| `DELETE` | `/orders/{id}` | Delete an order (restores stock) |

**Status codes:** `201` on creation, `204` on deletion, `404` for missing
resources, `409` for conflicts (duplicate SKU/email or insufficient stock), and
`422` for validation errors.

---

## 📁 Project Structure

```
inventory-order-system/
├── backend/                # FastAPI application
│   ├── app/
│   │   ├── main.py         # app entry point, CORS, startup
│   │   ├── database.py     # DB connection (SQLite / PostgreSQL)
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── crud.py         # business logic
│   │   └── routers/        # API endpoints
│   ├── alembic/            # database migrations
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── api/            # Axios API clients
│   │   ├── components/     # reusable UI components
│   │   ├── pages/          # Dashboard, Products, Customers, Orders
│   │   └── context/        # toast notifications
│   ├── Dockerfile
│   └── vercel.json
├── .github/workflows/      # CI: build & push backend image to Docker Hub
├── docker-compose.yml
├── render.yaml             # Render blueprint (backend + PostgreSQL)
└── README.md
```

---

## 📦 Using the Docker Hub Image

The backend image is published to Docker Hub and can be run directly:

```bash
docker run -p 8000:8000 saransh777/inventory-backend:latest
```

It defaults to SQLite; provide a `DATABASE_URL` environment variable to connect
it to PostgreSQL.

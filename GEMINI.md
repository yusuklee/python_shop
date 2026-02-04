# GEMINI.md

## Project Overview

This is a full-stack web application for a Python Shop. It consists of a Python backend and a Next.js frontend.

### Backend

The backend is a FastAPI application located in the `app` directory. It provides a RESTful API for managing the shop's data, including members, items, orders, and categories.

*   **Framework:** FastAPI
*   **Database:** MySQL with SQLAlchemy
*   **Key Modules:**
    *   `main.py`: The main entry point of the FastAPI application.
    *   `api/`: Contains the API endpoints for different resources.
    *   `core/`: Contains the business logic and services.
    *   `crud/`: Contains the CRUD operations for database models.
    *   `db/`: Contains the database session management.
    *   `models/`: Contains the SQLAlchemy database models.
    *   `tests/`: Contains the tests for the backend.

### Frontend

The frontend is a Next.js application located in the `Front` directory. It provides the user interface for interacting with the shop.

*   **Framework:** Next.js (with App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI Components:** Radix UI, Lucide Icons, Recharts
*   **Data Fetching:** SWR
*   **Forms:** React Hook Form
*   **Validation:** Zod

## Building and Running

### Backend

To run the backend, you need to have Python and MySQL installed.

1.  **Install dependencies:**
    ```bash
    pip install -r app/requirements.txt


2.  **Set up the database:**
    *   Make sure you have a MySQL server running.
    *   Create a database named `python_shop`.
    *   Update the database connection string in `app/db/session.py` if necessary.

3.  **Run the application:**
    ```bash
    uvicorn app.main:app --reload
    ```

### Frontend

To run the frontend, you need to have Node.js and pnpm installed.

1.  **Install dependencies:**
    ```bash
    cd Front
    pnpm install
    ```

2.  **Run the application:**
    ```bash
    pnpm dev
    ```

## Development Conventions

*   The backend follows a modular structure with a clear separation of concerns.
*   The frontend uses a modern tech stack with a focus on component-based architecture.
*   The project uses `pnpm` for package management in the frontend.

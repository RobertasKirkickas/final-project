# Community Clean-Up and Litter Reporting Platform

A full-stack web application built with a Django REST API backend and a React frontend.

## 🚀 Tech Stack

**Frontend:**

- React.js
- Bootstrap
- Axios

**Backend:**

- Python
- Django and Django REST Framework (DRF)
- SQLite

## ✨ Core Features

- **User Authentication:** Secure registration and login system with custom user profiles.
- **Litter Reporting:** Users can submit reports with titles, descriptions, scheduled time, categories (e.g., Waterfront, Residential), and image uploads.
- **Interactive Dashboard:** Users can view, track, and manage their submitted reports.
- **Community Engagement:** Commenting system and bookmarking functionality for specific posts.
- **Automated Slug Generation:** SEO-friendly URLs generated automatically for each report.

## 🛠️ Installation and Local Setup

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- Python
- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/RobertasKirkickas/final-project.git
```

`cd final-project`

### 2. Backend Setup (Django)

Open a terminal and navigate to the backend directory:

```bash
cd backend

# Install required Python packages
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Run the development server
python manage.py runserver
```

The backend will be available at `http://localhost:8000/`

### 3. Frontend Setup (React)

Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend

# Install Node modules
npm install

# Start the React development server
npm run dev
```

The frontend application will be available at `http://localhost:5173/`

## 📁 Project Structure

```text
├── backend/               # Django REST API
│   ├── api/               # Main application logic (Models, Views, URLs)
│   └── backend/           # Core settings and configurations
│
│
└── frontend/              # React Application
    ├── src/               # React components, views, and assets
    └── package.json       # Node.js dependencies
```

## 📄 License

This project was developed as a final year BSc Computer Science project.

# C³ Cafe POS - Frontend Foundation

React + Vite frontend application for the C³ Cafe POS System.

---

## Folder Structure

```
frontend/
├── public/
├── src/
│   ├── assets/        # Media assets and static files
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── layouts/       # Application layouts (MainLayout)
│   ├── pages/         # Page components (HomePage)
│   ├── router/        # React Router DOM configuration
│   ├── services/      # Axios API HTTP client & endpoints
│   ├── store/         # Zustand global state management
│   ├── styles/        # Tailwind CSS & global styles
│   ├── utils/         # Helper functions & utilities
│   ├── App.jsx        # Root application component
│   └── main.jsx       # React application entry point
├── .env               # Environment configuration
├── index.html         # HTML template
├── package.json       # Project dependencies & scripts
├── README.md          # Frontend documentation
└── vite.config.js     # Vite configuration
```

---

## Setup & Installation

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

---

## Development & Execution

### Run Development Server

Start the Vite development server on `http://localhost:5173`:

```bash
npm run dev
```

### Build Production Bundle

Compile and optimize the application for production:

```bash
npm run build
```

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

---

## Environment Configuration

Configuration variables are stored in `.env`:

```env
VITE_API_URL=http://localhost:8000
```

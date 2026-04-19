# Advanced Contact Book Application

Production-ready contact management application with Angular 21, Angular Material, Express, Sequelize, and MySQL.

## Folder Structure

```text
SSINFO/
  backend/
    src/
      config/
      constants/
      controllers/
      middleware/
      models/
      routes/
      services/
      utils/
      validators/
  frontend/
    src/app/
      core/
      models/
      modules/
        upload/
        contacts/
        contact-detail/
      shared/
  docs/
    mysql-schema.sql
    postman-samples.md
```

## Run Locally

1. Create MySQL database with [docs/mysql-schema.sql](/g:/SSINFO/docs/mysql-schema.sql:1).
2. Copy `backend/.env.example` to `backend/.env` and update DB credentials.
3. Install backend packages:
   `cd backend && npm install`
4. Install frontend packages:
   `cd frontend && npm install`
5. Start backend:
   `npm run dev`
6. Start frontend:
   `npm start`
7. Open `http://localhost:4200`.

## Key Features

- Excel import with client-side pre-validation and backend validation.
- Material data table with pagination, search, sorting, filtering, selection, export, and batch delete.
- Contact detail editor with server-side edit lock.
- Global loading indicator, API interceptor, clean layered backend, and `.env` based configuration.

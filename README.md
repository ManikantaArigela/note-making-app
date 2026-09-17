# LuminalNotes

A beginner-friendly MERN notes application. Create, edit, pin, search, tag, color-code, and delete notes through a React interface backed by an Express and MongoDB API.

## Features

- Full note CRUD (create, read, update, and delete)
- Pin important notes; pinned notes are listed first
- Search by title, content, or tags
- Comma-separated tags and selectable note colors
- Responsive React/Vite frontend with an Express REST API
- Zero-setup in-memory MongoDB fallback for local development

## Tech stack

- Frontend: React 18, Vite, Lucide React
- Backend: Node.js, Express, Mongoose
- Database: MongoDB or `mongodb-memory-server`

## Getting started

### Prerequisites

- Node.js 18 or later
- npm

### Install dependencies

From the project root:

```bash
npm run install-all
```

### Start development servers

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173). The frontend proxies `/api` requests to the Express server at `http://localhost:5000`.

## Database configuration

By default, the backend starts a temporary in-memory MongoDB instance, so no database setup is required. Its data is cleared whenever the server stops.

To use a persistent MongoDB database, create `backend/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/luminalnotes
PORT=5000
```

You can also supply a MongoDB Atlas connection string as `MONGODB_URI`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run install-all` | Install root, frontend, and backend dependencies |
| `npm run dev` | Start frontend and backend concurrently |
| `npm run dev:frontend` | Start Vite on port 5173 |
| `npm run dev:backend` | Start Express with Nodemon on port 5000 |
| `npm run build --prefix frontend` | Create a production frontend build |

## API

Base URL: `/api/notes`

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/notes` | List notes, with pinned and recently updated notes first |
| `POST` | `/api/notes` | Create a note |
| `PUT` | `/api/notes/:id` | Update a note |
| `DELETE` | `/api/notes/:id` | Delete a note |

Example request body for creating or updating a note:

```json
{
  "title": "Project ideas",
  "content": "Draft the feature list.",
  "pinned": true,
  "color": "#2d264d",
  "tags": ["work", "ideas"]
}
```

## Project structure

```text
backend/           Express API and Mongoose model
frontend/          React and Vite client
package.json       Root development scripts
```

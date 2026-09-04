# Lecture Scheduling System

A full-stack lecture scheduling application for administrators and instructors. Administrators manage instructors, courses, lectures, notifications, and extra-lecture requests. Instructors can view their assigned lectures and submit extra-lecture requests.

## Technology Stack

### Frontend

- React 19
- React DOM
- React Router DOM 7
- Vite 8
- Axios
- Tailwind CSS 4 with `@tailwindcss/vite`
- Bootstrap 5
- Lucide React icons
- ESLint with React Hooks and React Refresh plugins

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose 9
- JSON Web Tokens for authentication
- bcryptjs for password hashing
- Multer for in-memory image uploads
- Cloudinary and Streamifier for optional course images
- CORS
- dotenv
- Nodemon for development

## Project Structure

```text
lecture-scheduling/
├── backend/
│   ├── package.json
│   ├── .env
│   └── src/
│       ├── config/          MongoDB and Cloudinary configuration
│       ├── controllers/     Request handling and business logic
│       ├── middleware/      Authentication, roles, and uploads
│       ├── models/          Mongoose schemas
│       ├── routes/          Express API routes
│       ├── utils/           Scheduling helpers
│       ├── seed.js          Demo-user seeder
│       └── server.js         API entry point
├── frontend/
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── components/      Shared layouts and route protection
│       ├── context/         Authentication context
│       ├── pages/            Login, admin, and instructor screens
│       ├── services/         Axios API client
│       ├── App.jsx           Frontend route configuration
│       └── main.jsx          React entry point
└── README.md
```

## Prerequisites

Install the following before setup:

- Node.js 18 or newer
- npm
- A MongoDB database, either MongoDB Atlas or a local MongoDB server
- Cloudinary credentials if course image uploads are required

## Installation

Install dependencies in both applications from the repository root:

```powershell
cd backend
npm install
cd ..\frontend
npm install
```

## Environment Configuration

Copy `backend/.env.example` to `backend/.env`, then replace the placeholder values:

```powershell
Copy-Item backend\.env.example backend\.env
```

The resulting `backend/.env` should contain:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

`MONGO_URI` and `JWT_SECRET` are required. Cloudinary variables are required only when uploading course images. Do not commit real database, JWT, or Cloudinary secrets to source control.

The frontend API client currently uses:

```text
http://localhost:5000/api
```

To use another backend URL, update `frontend/src/services/api.js`.

## Demo Credentials

The seed script creates these users:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@test.com` | `Admin@123` |
| Instructor | `rahul@test.com` | `Rahul@123` |
| Instructor | `amit@test.com` | `Rahul@123` |
| Instructor | `priya@test.com` | `Rahul@123` |

Run the seeder only when you intend to replace the existing users. It deletes all records from the `User` collection before inserting the demo users:

```powershell
cd backend
node src/seed.js
```

## Running the Application

Open two terminals from the repository root.

### Backend API

```powershell
cd backend
npm run dev
```

The API runs at [http://localhost:5000](http://localhost:5000).

For a production-style start:

```powershell
cd backend
npm start
```

### Frontend

```powershell
cd frontend
npm run dev
```

Vite normally serves the application at [http://localhost:5173](http://localhost:5173). Open that address in a browser.

## Frontend Links

| Screen | Link | Access |
| --- | --- | --- |
| Login | [http://localhost:5173/login](http://localhost:5173/login) | Public |
| Admin dashboard | [http://localhost:5173/admin](http://localhost:5173/admin) | Admin |
| Courses | [http://localhost:5173/admin/courses](http://localhost:5173/admin/courses) | Admin |
| Instructors | [http://localhost:5173/admin/instructors](http://localhost:5173/admin/instructors) | Admin |
| Lectures | [http://localhost:5173/admin/lectures](http://localhost:5173/admin/lectures) | Admin |
| Notifications | [http://localhost:5173/admin/notifications](http://localhost:5173/admin/notifications) | Admin |
| Extra-lecture requests | [http://localhost:5173/admin/extra-lectures](http://localhost:5173/admin/extra-lectures) | Admin |
| Instructor dashboard | [http://localhost:5173/instructor](http://localhost:5173/instructor) | Instructor |

## API Reference

Base URL: `http://localhost:5000/api`

Authenticated requests require this header:

```http
Authorization: Bearer <jwt-token>
```

### Authentication

| Method | Endpoint | Access | Purpose |
| --- | --- | --- |
| `POST` | `/auth/login` | Public | Log in and receive a JWT token |

Login body:

```json
{
  "email": "admin@test.com",
  "password": "Admin@123"
}
```

### Courses

| Method | Endpoint | Access | Purpose |
| --- | --- | --- |
| `GET` | `/courses` | Admin | List all courses |
| `GET` | `/courses/:id` | Admin | Get one course |
| `POST` | `/courses` | Admin | Create a course and generate regular lectures |
| `PUT` | `/courses/:id` | Admin | Update a course and regenerate regular lectures |

Course create/update requests use `multipart/form-data`. Fields include `name`, `level`, `description`, `startDate`, `endDate`, `weeklyDays`, `startTime`, `endTime`, `instructor`, and optional `image`.

### Instructors

| Method | Endpoint | Access | Purpose |
| --- | --- | --- |
| `GET` | `/instructors/me/lectures` | Instructor | List the signed-in instructor's lectures |
| `POST` | `/instructors` | Admin | Create an instructor |
| `GET` | `/instructors` | Admin | List instructors |
| `GET` | `/instructors/:id` | Admin | Get one instructor |

### Lectures

| Method | Endpoint | Access | Purpose |
| --- | --- | --- |
| `POST` | `/lectures` | Admin | Create a manual lecture |
| `GET` | `/lectures` | Admin | List all lectures |
| `GET` | `/lectures/:id` | Admin | Get one lecture |
| `PUT` | `/lectures/:id` | Admin | Update a lecture |

### Extra-Lecture Requests

| Method | Endpoint | Access | Purpose |
| --- | --- | --- |
| `POST` | `/extra-lectures` | Instructor | Submit an extra-lecture request |
| `GET` | `/extra-lectures/my` | Instructor | List the instructor's own requests |
| `GET` | `/extra-lectures` | Admin | List all requests |
| `PUT` | `/extra-lectures/:id/approve` | Admin | Approve a request |
| `PUT` | `/extra-lectures/:id/reject` | Admin | Reject a request |

### Notifications

| Method | Endpoint | Access | Purpose |
| --- | --- | --- |
| `GET` | `/notifications` | Admin | List notifications |
| `PATCH` | `/notifications/read-all` | Admin | Mark all notifications as read |
| `PATCH` | `/notifications/:id/read` | Admin | Mark one notification as read |

### Health and Test Endpoint

| Method | Endpoint | Access | Purpose |
| --- | --- | --- |
| `GET` | `/` | Public | Confirm the API is running |
| `GET` | `/api/test/admin` | Admin | Verify admin authentication and role access |

The root health check response is available at [http://localhost:5000/](http://localhost:5000/).

## Scheduling Rules

- Courses require a valid instructor, date range, weekly day, and start/end time.
- End time must be later than start time.
- At least one weekly day must be selected.
- Course creation generates one regular lecture for every matching date.
- The system checks instructor time conflicts before creating or updating schedules.
- Multiple non-overlapping lectures may exist for the same instructor on the same date.
- Course images are optional.

## Available Scripts

### Backend

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with Nodemon |
| `npm start` | Start the API with Node |

### Frontend

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Troubleshooting

### Port already in use

Stop the process using port `5000` or change `PORT` in `backend/.env`. Update the frontend API base URL if the backend port changes.

### Authentication errors

Confirm that `JWT_SECRET` is defined exactly with uppercase letters in `backend/.env`. Restart the backend after changing environment variables, then log in again to obtain a new token.

### Course image upload errors

Confirm that all Cloudinary values belong to the same Cloudinary account. Course creation can continue without an image when an optional image upload fails.

### Database errors

Confirm that `MONGO_URI` is valid, the MongoDB server is reachable, and the database user has permission to read and write the application collections.

## Security Notes

- Keep `backend/.env` out of commits and public repositories.
- Replace the demo credentials before deploying.
- Use a long, randomly generated `JWT_SECRET` in every deployed environment.
- Restrict MongoDB and Cloudinary credentials to the minimum required permissions.
- Configure a production frontend API URL instead of using localhost.

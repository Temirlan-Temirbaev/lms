# Language Learning Management System

A comprehensive language learning platform with courses, lessons, tests, and a placement test system.

## Running with Docker

### Prerequisites

- Docker
- Docker Compose

### Getting Started

1. Clone the repository:
   ```
   git clone <repository-url>
   cd lms
   ```

2. Start the application using Docker Compose:
   ```
   docker-compose up -d
   ```

   This will:
   - Start MongoDB
   - Build and start the server

3. Seed the database with sample data:
   ```
   ./seed-db.sh
   ```

4. The server will be available at:
   ```
   http://localhost:5002
   ```

5. To stop the application:
   ```
   docker-compose down
   ```

### Environment Variables

The following environment variables can be configured in the `docker-compose.yml` file:

- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRE`: JWT token expiration time
- `JWT_COOKIE_EXPIRE`: JWT cookie expiration time

## Running Without Docker

### Server

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables in a `.env` file:
   ```
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/language-learning
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   ```

4. Seed the database:
   ```
   node seeder.js
   ```

5. Start the server:
   ```
   npm start
   ```

### Mobile App

1. Navigate to the mobile directory:
   ```
   cd mobile
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the Expo development server:
   ```
   npm start
   ```

4. Follow the instructions to run the app on a simulator or physical device.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get a single course
- `GET /api/courses/:id/lessons` - Get lessons for a course
- `GET /api/courses/:id/tests` - Get tests for a course

### Lessons
- `GET /api/courses/lessons/:id` - Get a single lesson
- `POST /api/courses/lessons/:id/complete` - Mark a lesson as completed

### Tests
- `GET /api/courses/tests/:id` - Get a single test
- `POST /api/courses/tests/:id/submit` - Submit test answers

### Placement Test
- `GET /api/placement-test` - Get the placement test
- `POST /api/placement-test/submit` - Submit placement test answers 
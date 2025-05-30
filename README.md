# Professional To-Do List Application

A modern, feature-rich to-do list application designed to boost productivity and help users organize their daily and weekly tasks.

## Features

- User authentication (registration and login)
- Task management (create, read, update, delete)
- Task categorization (Personal, Work, Study, Health, Other)
- Priority levels (Low, Medium, High)
- Deadline and reminder options
- Drag-and-drop task reordering
- Progress tracking
- Focus Mode for single-task concentration
- Dark mode support
- Analytics dashboard

## Tech Stack

- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT
- Frontend: React (to be implemented)

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/todo-app
   JWT_SECRET=your-super-secret-key-here
   NODE_ENV=development
   ```

4. Start MongoDB server

5. Run the application:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user

### Tasks
- GET /api/tasks - Get all tasks
- POST /api/tasks - Create new task
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task
- PUT /api/tasks/reorder - Update task order
- GET /api/tasks/category/:category - Get tasks by category
- GET /api/tasks/due/:date - Get tasks with due date

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. #   t o - d o - l i s t -  
 
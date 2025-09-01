# grouPES

```
                            ____  ___________
   ____ __________  __  __/ __ \/ ____/ ___/
  / __ `/ ___/ __ \/ / / / /_/ / __/  \__ \
 / /_/ / /  / /_/ / /_/ / ____/ /___ ___/ /
 \__, /_/   \____/\__,_/_/   /_____//____/
/____/
```

**A no-nonsense project group maker for educational institutions.**

## Overview

grouPES is a comprehensive web-based platform designed to streamline team formation and assignment management in educational environments. The system features three role-based dashboards (Admin, Teacher, and Student) with real-time collaboration tools, drag-and-drop group management, and automated email notifications.

## Features

### Admin Dashboard
- Bulk user import via CSV (students and teachers)
- Password management and reset functionality
- Email notification system
- Database management and reset tools
- User account administration

### Teacher Dashboard
- Assignment creation and management
- Group/team formation with drag-and-drop interface
- Assignment distribution across classes
- Real-time updates and notifications
- Student performance tracking

### Student Dashboard
- Assignment viewing and submission
- Team/group participation
- Invitation system for group formation
- Request management
- Profile management

## Tech Stack

### Frontend
- **React** 18.3.1 - UI framework
- **Vite** 5.4.0 - Build tool and dev server
- **TailwindCSS** 3.4.14 - Utility-first CSS framework
- **Shadcn/UI** - Component library
- **React Router** 6.27.0 - Client-side routing
- **React DnD** - Drag-and-drop functionality
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** / **Express** 4.21.1 - Server framework
- **MySQL2** 3.11.3 - Database driver
- **Nodemailer** 6.9.16 - Email service
- **Passport** 0.7.0 - Authentication middleware
- **Multer** - File upload handling
- **Socket.io** 4.8.1 - WebSocket server

## Project Structure

```
group-pesu/
├── src/                          # Main application source
│   ├── *.jsx                     # React components
│   ├── *.module.css              # Component styles
│   ├── *.cjs                     # Backend server files
│   └── entry.jsx                 # Application entry point
│
├── admin_dash/                   # Admin dashboard
│   ├── server.js                 # Express API (Port 3000)
│   ├── Student.csv               # Sample student data
│   ├── Teacher.csv               # Sample teacher data
│   └── front/                    # React frontend
│
├── teacher_dash/                 # Teacher dashboard
│   ├── server.js                 # Express API (Port 5000)
│   └── front/                    # React frontend
│
├── student_dash/                 # Student dashboard
│   ├── server.js                 # Express API (Port 3001)
│   └── front/                    # React frontend
│
├── public/                       # Static assets
├── assets/                       # Project images/mockups
├── DB_template.sql               # Database schema
├── package.json                  # Root dependencies
└── vite.config.js                # Vite configuration
```

## Installation & Setup

### Prerequisites
- Node.js 16+
- MySQL 8.0+
- npm or yarn

### 1. Database Setup

```bash
# Create the database
mysql -u root -p
CREATE DATABASE dbms_project;
exit

# Import the schema
mysql -u root -p dbms_project < DB_template.sql
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dbms_project

# Email Configuration (for Admin Dashboard)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Server Ports
ADMIN_PORT=3000
TEACHER_PORT=5000
STUDENT_PORT=3001
```

### 3. Install Dependencies

```bash
# Root application
npm install

# Admin dashboard
cd admin_dash && npm install
cd front && npm install
cd ../..

# Teacher dashboard
cd teacher_dash && npm install
cd front && npm install
cd ../..

# Student dashboard
cd student_dash && npm install
cd front && npm install
cd ../..
```

### 4. Running the Application

#### Main Application (Vite)
```bash
npm run dev
# Runs on http://localhost:5173
```

#### Admin Dashboard
```bash
# Terminal 1 - Backend
cd admin_dash
node server.js

# Terminal 2 - Frontend
cd admin_dash/front
npm start
```

#### Teacher Dashboard
```bash
# Terminal 1 - Backend
cd teacher_dash
node server.js

# Terminal 2 - Frontend
cd teacher_dash/front
npm start
```

#### Student Dashboard
```bash
# Terminal 1 - Backend
cd student_dash
node server.js

# Terminal 2 - Frontend
cd student_dash/front
npm start
```

## API Endpoints

### Admin Dashboard (Port 3000)
- `POST /upload-students` - Bulk import students via CSV
- `POST /upload-teachers` - Bulk import teachers via CSV
- `POST /reset-password` - Reset user password
- `POST /send-email` - Send notification emails
- `DELETE /reset-database` - Reset entire database

### Teacher Dashboard (Port 5000)
- `GET /assignments` - Fetch all assignments
- `POST /assignments` - Create new assignment
- `PUT /assignments/:id` - Update assignment
- `DELETE /assignments/:id` - Delete assignment
- `GET /assignments/:id/classes` - Get assignment classes

### Student Dashboard (Port 3001)
- `GET /assignments` - Fetch student assignments
- `POST /groups` - Create/join group
- `GET /invitations` - Fetch pending invitations
- `POST /requests` - Send group request

## Database Schema

The system uses a MySQL database with the following main tables:

- **Admin** - Administrator accounts
- **Student** - Student profiles and credentials
- **Teacher** - Teacher profiles and credentials
- **Assignment** - Assignment details
- **AssignmentClass** - Assignment-class mappings
- **Group** - Team/group information
- **Invitation** - Group invitation tracking
- **Request** - Group request management

See `DB_template.sql` for complete schema details including triggers and constraints.

## Development

### Code Style
- ESLint configuration included (`eslint.config.js`)
- React components use functional components with hooks
- CSS Modules for scoped styling
- CommonJS (.cjs) for backend compatibility

### Key Files
- **src/AuthContext.jsx** - Authentication state management
- **src/PrivateRoute.jsx** - Protected route wrapper
- **src/server.cjs** - Main backend server logic
- **vite.config.js** - Vite build configuration

## Security Considerations

**IMPORTANT:** Before deploying to production:

1. **Move database credentials to environment variables** - Currently hardcoded in server files
2. **Remove or secure sample data** - `Student.csv` and `Teacher.csv` contain example records
3. **Enable HTTPS** - Configure SSL certificates for production
4. **Update CORS settings** - Restrict allowed origins in server configurations
5. **Secure email credentials** - Use environment variables for nodemailer configuration
6. **Implement rate limiting** - Add middleware to prevent API abuse
7. **Validate all user inputs** - Add proper sanitization and validation

## Contributing

1. Follow the existing code structure and naming conventions
2. Test all changes across Admin, Teacher, and Student dashboards
3. Update this README when adding new features or changing architecture
4. Ensure all backend servers run without errors before committing

## Known Issues

- Hardcoded teacher ID in `teacher_dash/server.js` - needs dynamic authentication
- Hardcoded class identifier in `student_dash/server.js` - should be user-specific
- Database credentials exposed in source files - migrate to `.env`

## License

[Add your license information here]

## Contact

[Add contact information or links here]

---

**Built with React, Node.js, and MySQL**

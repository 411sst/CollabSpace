# grouPES - Complete Setup Guide

This guide will walk you through setting up the grouPES application from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Application Setup](#application-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
  ```bash
  node --version  # Should be v16+
  ```

- **npm** (comes with Node.js)
  ```bash
  npm --version
  ```

- **MySQL** (v8.0 or higher)
  ```bash
  mysql --version
  ```

- **Git** (for version control)
  ```bash
  git --version
  ```

---

## Database Setup

### Step 1: Start MySQL

Ensure MySQL server is running:

```bash
# Linux/Mac
sudo systemctl start mysql
# or
sudo service mysql start

# Windows (if using XAMPP)
# Start MySQL from XAMPP Control Panel
```

### Step 2: Create Database

Open MySQL command line:

```bash
mysql -u root -p
# Enter your MySQL root password
```

Create the database:

```sql
CREATE DATABASE dbms_project;
exit;
```

### Step 3: Import Schema

Import the provided database template:

```bash
mysql -u root -p dbms_project < DB_template.sql
```

Verify the import:

```bash
mysql -u root -p dbms_project
```

```sql
SHOW TABLES;
-- You should see: Admin, Student, Teacher, Assignment, AssignmentClass, etc.
exit;
```

---

## Application Setup

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd group-pesu
```

### Step 2: Install Root Dependencies

```bash
npm install
```

This installs dependencies for the main integrated application.

### Step 3: Install Dashboard Dependencies (Optional)

Only if you plan to use the standalone dashboards:

```bash
# Admin Dashboard
cd admin_dash
npm install
cd front && npm install
cd ../..

# Teacher Dashboard
cd teacher_dash
npm install
cd front && npm install
cd ../..

# Student Dashboard
cd student_dash
npm install
cd front && npm install
cd ../..
```

---

## Environment Configuration

### Step 1: Create .env File

Copy the example file:

```bash
cp .env.example .env
```

### Step 2: Configure Database Credentials

Edit `.env` and update the database section:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=dbms_project
```

### Step 3: Configure Email (Gmail)

For password reset and notifications, you need a Gmail App Password.

#### Generate Gmail App Password:

1. Go to your Google Account: https://myaccount.google.com
2. Click "Security" in the left sidebar
3. Under "How you sign in to Google", enable "2-Step Verification" (if not already enabled)
4. After enabling 2FA, go back to Security
5. Under "How you sign in to Google", click "App passwords"
6. Select "Mail" and "Other (Custom name)"
7. Enter "grouPES" as the name
8. Click "Generate"
9. Copy the 16-character password (without spaces)

Update `.env`:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # The 16-char app password
```

### Step 4: Configure Ports (Optional)

Default ports are fine for most setups. Only change if you have conflicts:

```env
MAIN_PORT=3000
ADMIN_PORT=3000
TEACHER_PORT=5000
STUDENT_PORT=3001
```

### Step 5: Test Configuration (Optional)

You can set default test IDs for development:

```env
DEFAULT_TEACHER_ID=PES4UG19CS118
DEFAULT_STUDENT_CLASS=M
```

**Note:** These should be removed in production and replaced with proper authentication.

---

## Running the Application

### Option A: Main Integrated Application (RECOMMENDED)

This is the full-featured application with authentication.

#### Terminal 1 - Frontend (Vite)

```bash
npm run dev
```

Expected output:
```
VITE v5.4.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

#### Terminal 2 - Backend (Node.js)

```bash
node src/server.cjs
```

Expected output:
```
Connected to the database.
Server running at http://localhost:3000
```

#### Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

You should see the login page.

#### Default Routes:

- `/login` - Login page
- `/register` - Registration page
- `/admin` - Admin dashboard (requires admin role)
- `/teacher` - Teacher dashboard (requires teacher role)
- `/assignment` - Student dashboard (requires student role)
- `/groups` - Group management
- `/main` - Main dashboard (after login)

---

### Option B: Standalone Dashboards (Optional)

These are simpler utilities for specific tasks.

#### Admin Dashboard

**Terminal 1:**
```bash
cd admin_dash
node server.js
```

**Terminal 2:**
```bash
cd admin_dash/front
npm start
```

Access at: `http://localhost:3000`

Features:
- Upload Student.csv and Teacher.csv
- View and update passwords
- Send password emails
- Reset database

#### Teacher Dashboard

**Terminal 1:**
```bash
cd teacher_dash
node server.js
```

**Terminal 2:**
```bash
cd teacher_dash/front
npm start
```

Features:
- Create assignments
- View created assignments
- Edit assignment details
- Delete assignments

#### Student Dashboard

**Terminal 1:**
```bash
cd student_dash
node server.js
```

**Terminal 2:**
```bash
cd student_dash/front
npm start
```

Features:
- View assignments for class M
- View assignment details
- See deadlines and requirements

---

## Testing

### Test Database Connection

Create a test file `test-db.js`:

```javascript
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Database connected successfully!');
  connection.end();
});
```

Run:
```bash
node test-db.js
```

### Test Email Configuration

The admin dashboard has a built-in email test. After starting the admin dashboard:

1. Go to "View Password and Push Mail"
2. Enter a valid Student ID (e.g., from Student.csv)
3. Click "View Password"
4. Check if email is sent successfully

---

## Troubleshooting

### Problem: "Cannot connect to database"

**Solution:**
- Verify MySQL is running: `sudo systemctl status mysql`
- Check `.env` credentials match your MySQL setup
- Try connecting manually: `mysql -u root -p dbms_project`

### Problem: "EADDRINUSE: Port already in use"

**Solution:**
- Check what's using the port: `lsof -i :3000` (Mac/Linux) or `netstat -ano | findstr :3000` (Windows)
- Kill the process or change port in `.env`

### Problem: "Module not found"

**Solution:**
- Ensure you ran `npm install` in the correct directory
- Try deleting `node_modules` and reinstalling: `rm -rf node_modules && npm install`

### Problem: "Email sending failed"

**Solution:**
- Verify you're using a Gmail App Password (not your regular password)
- Ensure 2FA is enabled on your Google account
- Check the app password has no spaces when copying to `.env`

### Problem: ".env file not loading"

**Solution:**
- Ensure `.env` is in the root directory (same level as package.json)
- Check file name is exactly `.env` (not `.env.txt`)
- Restart the server after changing `.env`

### Problem: "Assignments not showing"

**Solution:**
- Ensure database has data: `SELECT * FROM Assignment;`
- Check `DEFAULT_STUDENT_CLASS` matches assignments in database
- Verify backend is running and accessible

---

## Next Steps

After setup:

1. **Populate Database**
   - Use the admin dashboard to upload Student.csv and Teacher.csv
   - Or insert test data manually via MySQL

2. **Create Test Accounts**
   - Register a student account
   - Register a teacher account
   - Use admin credentials from Admin table

3. **Test Features**
   - Create an assignment as a teacher
   - View assignments as a student
   - Form groups and test invitations

4. **Production Deployment**
   - Follow security checklist in README.md
   - Remove test IDs from `.env`
   - Set up proper authentication
   - Enable HTTPS
   - Set up proper CORS

---

## Useful Commands

```bash
# Start main app
npm run dev && node src/server.cjs

# Check MySQL tables
mysql -u root -p dbms_project -e "SHOW TABLES;"

# View all assignments
mysql -u root -p dbms_project -e "SELECT * FROM Assignment;"

# Reset a specific table
mysql -u root -p dbms_project -e "TRUNCATE TABLE Assignment;"

# Check if port is in use
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# View environment variables
cat .env

# Check Node/npm versions
node -v && npm -v
```

---

## Getting Help

- **Issues:** Check the Known Issues section in README.md
- **Documentation:** See README.md for architecture details
- **Database Schema:** Check DB_template.sql for table structures
- **API Endpoints:** See README.md API Endpoints section

---

**Happy Coding!** 🚀

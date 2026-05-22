# Disha
> **Guided by Purpose, Driven by Progress**

Disha is a modern, secure, and production-ready Task Management system designed to streamline workflows with robust Role-Based Access Control (RBAC) and comprehensive Activity Tracking.

---

## 🚀 Key Features

* **Secure Authentication**: JWT-based secure user registration and login.
* **Role-Based Access Control (RBAC)**: Distinct permissions for regular Users and system Admins.
* **Real-time Activity Logs**: Comprehensive audit logs to track user actions, state changes, and system events.
* **Exclusively Powered by MongoDB**: Fast, reliable, and persistent data storage.

---

## 🛠️ Architecture Upgrade: How & Why It Was Done

Previously, the project operated with a dual-database design, containing a proxy wrapper that would fallback to local JSON files if MongoDB was unavailable. 

### What We Did (Implementation Details)
1. **Strict Connection Policy**: Rewrote [db.js](file:///c:/Users/manis/.gemini/antigravity-ide/scratch/task-manager/backend/config/db.js) to connect exclusively to MongoDB. The server will fail-fast and exit if MongoDB is not running, preventing silent operational failure.
2. **Standard Mongoose Integration**: Refactored the database models—[User.js](file:///c:/Users/manis/.gemini/antigravity-ide/scratch/task-manager/backend/models/User.js), [Task.js](file:///c:/Users/manis/.gemini/antigravity-ide/scratch/task-manager/backend/models/Task.js), and [ActivityLog.js](file:///c:/Users/manis/.gemini/antigravity-ide/scratch/task-manager/backend/models/ActivityLog.js)—to use native Mongoose models directly. 
3. **Completed Data Migration**: Migrated all local testing records (users, tasks, logs) from the temporary JSON database into MongoDB.
4. **Codebase Cleanup**: Removed unnecessary code (like `modelWrapper.js`, local data folders, and temporary scripts) to keep the project clean, lightweight, and focused.

### Why This is the Best Approach
* **Single Source of Truth**: Eliminating the file-based fallback prevents "data drift" (where local data differs from Mongo data) and keeps database transactions consistent.
* **Fail-Fast for Safety**: In professional development, it is always best to fail immediately if dependencies (like the database) are offline. Silent fallbacks can lead to corrupted local files and misleading environment behavior.
* **Native Query Optimization**: Directly using Mongoose models allows full leverage of MongoDB features like indexes, aggregation pipelines, complex schemas, and auto-populated references without custom wrapper limitations.
* **Maintainability**: The codebase is now standard, making it easy for any Node.js/Mongoose developer to read, maintain, and expand.

---

## 👥 Access Control Matrix (Roles & Permissions)

| Action | User (Regular) | Admin (Administrator) |
| :--- | :---: | :---: |
| **Create Tasks** | ✅ (Own) | ❌ (Admins monitor only) |
| **View Tasks** | ✅ (Own Only) | ✅ (Global View - All Users) |
| **Edit/Update Tasks** | ✅ (Own Only) | ❌ |
| **Delete Tasks** | ✅ (Own Only) | ✅ (Any User's Task) |
| **View Users List** | ❌ | ✅ (All Registered Users) |
| **Change User Status** | ❌ | ✅ (Activate / Deactivate Users) |
| **Delete User Account** | ❌ | ✅ (Deletes User & their tasks) |
| **View Audit / Activity Logs** | ❌ | ✅ (Monitor system-wide events) |

---

## 🏃‍♂️ Getting Started

### Prerequisites
* **Node.js** (v16 or higher)
* **MongoDB** (Running locally on port `27017` or using a cloud URI)

### Installation & Run

1. **Start the Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```
   *The backend will automatically connect to MongoDB and seed default accounts on the first run.*

2. **Start the Frontend Server**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Web App**:
   Open [http://localhost:5173](http://localhost:5173) in your browser.

### 🔑 Seeding Credentials
* **Admin Account**: `admin@example.com` / `admin123`
* **Regular User Account**: `user@example.com` / `user123`

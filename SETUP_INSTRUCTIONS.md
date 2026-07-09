# 🏠 GharSeva — Complete Setup Instructions
> Follow this guide step-by-step to run the GharSeva project on your local machine.

---

## ✅ Prerequisites (Install These First)

Before starting, make sure you have the following installed on your PC:

### 1. Node.js (v18 or above)
- Download from: **https://nodejs.org/**
- Choose the **LTS** version
- After installing, verify in terminal:
  ```
  node -v
  npm -v
  ```

### 2. MongoDB Community Server
- Download from: **https://www.mongodb.com/try/download/community**
- During installation, select **"Install MongoDB as a Service"** ✅
- After installing, MongoDB will run automatically in the background
- Verify in terminal:
  ```
  mongod --version
  ```

### 3. Git (Optional but recommended)
- Download from: **https://git-scm.com/**

---

## 📁 Step 1 — Extract the Project

1. Extract the zip file you received
2. You will see a folder called `gharseva` with two sub-folders:
   ```
   gharseva/
   ├── backend/
   ├── frontend/
   └── SETUP_INSTRUCTIONS.md  (this file)
   ```
3. Place the `gharseva` folder somewhere easy to access, e.g., `C:\Projects\gharseva` or your Desktop

---

## ⚙️ Step 2 — Set Up the Backend

Open a **new terminal / Command Prompt / PowerShell** window.

### Navigate to the backend folder:
```bash
cd path\to\gharseva\backend
```
*(Replace `path\to\` with your actual folder path, e.g., `cd C:\Projects\gharseva\backend`)*

### Install backend dependencies:
```bash
npm install
```

### Create the environment file:
The backend needs a `.env` file for configuration. Create a file named `.env` inside the `backend/` folder with the following content:

```
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/gharseva
JWT_SECRET=supersecretjwtkey1234567890
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=gharsevalocalservice@gmail.com
EMAIL_PASS=bjqjxvklzjbcuwnq
EMAIL_FROM="GharSeva <gharsevalocalservice@gmail.com>"
```

> **Note:** If a `.env` file already exists in the backend folder (from the zip), you do not need to create it again.

### Seed the database (Add sample data):
```bash
node seed.js
```
This will populate the database with sample users, services, categories, and bookings so the app has data to show.

> WARNING: Running seed.js will CLEAR all existing data and replace it with fresh sample data. Only run this once at the beginning.

### Start the backend server:
```bash
node server.js
```

You should see:
```
MongoDB Connected: 127.0.0.1
Server running in development mode on port 5001
```

**Keep this terminal window open.** The backend must keep running.

---

## 🎨 Step 3 — Set Up the Frontend

Open a **second, new terminal** window (keep the backend one open).

### Navigate to the frontend folder:
```bash
cd path\to\gharseva\frontend
```

### Install frontend dependencies:
```bash
npm install
```

### Start the frontend development server:
```bash
npm run dev
```

You should see something like:
```
  VITE v8.x.x  ready in xxx ms

  Local:   http://localhost:5173/
```

**Keep this terminal window open too.**

---

## 🌐 Step 4 — Open the App in Browser

Once both servers are running, open your browser and go to:

```
http://localhost:5173
```

The GharSeva app should load!

---

## 👤 Default Login Credentials (for Demo)

After running `node seed.js`, you can log in with these accounts:

| Role     | Email                      | Password      |
|----------|----------------------------|---------------|
| Admin    | admin@gharseva.com         | Admin@123     |
| Customer | customer@gharseva.com      | Customer@123  |
| Provider | provider@gharseva.com      | Provider@123  |

> You can also register a new account directly from the website.

---

## 🛠️ Troubleshooting

### "Cannot connect to MongoDB"
- Make sure MongoDB service is running
- On Windows: Press `Win + R` → type `services.msc` → find **MongoDB** → click **Start**
- Or run in terminal: `net start MongoDB`

### "Port 5001 already in use"
- Another program is using port 5001
- Change `PORT=5001` to `PORT=5002` in your `.env` file
- Also update the frontend API URL if needed (search for `localhost:5001` in `frontend/src/` files)

### "npm install" fails
- Make sure Node.js is properly installed: `node -v`
- Try deleting `node_modules` folder and `package-lock.json`, then run `npm install` again

### Frontend shows blank page or errors
- Make sure the **backend is running** on port 5001 first
- Check the browser console (F12 key) for specific error messages

### Images not showing
- The `uploads/` folder inside `backend/` is created automatically when the server starts
- If images are missing, they may not have been included in the zip (uploaded images are user-specific)

---

## 📋 Quick Summary Checklist

- [ ] Node.js installed (`node -v` works)
- [ ] MongoDB installed and running
- [ ] `.env` file created inside `backend/`
- [ ] `npm install` done inside `backend/`
- [ ] `node seed.js` run once to add sample data
- [ ] `node server.js` running in Terminal 1
- [ ] `npm install` done inside `frontend/`
- [ ] `npm run dev` running in Terminal 2
- [ ] Browser opened at `http://localhost:5173`

---

## 📂 Tech Stack (For Reference)

| Layer            | Technology                    |
|------------------|-------------------------------|
| Frontend         | React 18 + Vite + Tailwind CSS|
| State Management | Redux Toolkit                 |
| Backend          | Node.js + Express.js          |
| Database         | MongoDB (Mongoose)            |
| Authentication   | JWT (JSON Web Tokens)         |
| File Uploads     | Multer                        |
| Email            | Nodemailer (Gmail SMTP)       |

---

*GharSeva — Local Home Services Marketplace*

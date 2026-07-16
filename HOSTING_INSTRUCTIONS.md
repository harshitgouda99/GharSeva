# 🌐 GharSeva — Full Deployment & Hosting Guide

This guide provides step-by-step instructions on how to host your entire GharSeva application (Backend + Frontend + MongoDB Database) online for free so anyone can access it from their browsers.

---

## 🗺️ Deployment Architecture Overview

```
 ┌─────────────────┐             ┌──────────────────┐
 │    Frontend     │             │     Backend      │
 │  (Static Site)  │ ──────────> │  (Web Service)   │
 │   Hosted on:    │  API Calls  │    Hosted on:    │
 │ Render/Netlify  │             │      Render      │
 └─────────────────┘             └──────────────────┘
                                           │
                                           │ Connects to
                                           ▼
                                 ┌──────────────────┐
                                 │   Cloud DB       │
                                 │ (MongoDB Atlas)  │
                                 └──────────────────┘
```

We will deploy in three parts:
1. **Database:** MongoDB Atlas (Free Cloud Database)
2. **Backend Server:** Render (Free Web Service hosting)
3. **Frontend App:** Render or Netlify (Free Static Site hosting)

---

# 📦 Part 1 — Set Up Your Cloud Database (MongoDB Atlas)

Since your local database (`localhost:27017`) cannot be accessed by a server on the internet, you must host your database in the cloud.

### 1. Create an Atlas Account
1. Go to **https://www.mongodb.com/products/platform/atlas-database** and sign up for a free account.
2. Select the **M0 Shared (Free)** tier.
3. Choose your provider (AWS/Google Cloud) and region (closest to you, e.g., Mumbai, Singapore).
4. Click **Create Cluster**.

### 2. Configure Security (Crucial Step)
1. **Database User:** Create a username and a strong password (e.g., username: `dbUser`, password: `dbPassword123`). Save these! Click **Create Database User**.
2. **Network Access (IP Access List):** 
   - Under "Where would you like to connect from?", select **Cloud Environment**.
   - Add IP Address: `0.0.0.0/0` (this allows Render to connect from anywhere).
   - Label it: `Access from Render`.
   - Click **Add Entry**.
3. Click **Finish and Close** and go to your dashboard.

### 3. Get Your Connection String (URI)
1. In your Atlas dashboard, click the **Connect** button next to your database cluster.
2. Choose **Drivers** under connect options.
3. Copy the connection string. It will look like this:
   ```
   mongodb+srv://dbUser:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
4. Replace `<password>` with the password you created in step 2.1 (remove the `<` and `>` characters). 
5. Also, add the database name `gharseva` right before the `?` character. Your final string should look like:
   ```
   mongodb+srv://dbUser:dbPassword123@cluster0.abcde.mongodb.net/gharseva?retryWrites=true&w=majority&appName=Cluster0
   ```

---

# 🚀 Part 2 — Deploy the Backend on Render

Render is a platform that lets you deploy backend servers straight from your GitHub repository.

### 1. Create a Render Account
1. Go to **https://render.com** and sign up.
2. Connect your GitHub account.

### 2. Create a Web Service
1. Click **New +** (top right) and select **Web Service**.
2. Connect your GitHub repository.
3. Configure the following fields:
   - **Name:** `gharseva-backend`
   - **Environment:** `Node`
   - **Region:** Choose one close to you.
   - **Branch:** `main`
   - **Root Directory:** `backend` ⚠️ *(Extremely important! Tell Render to look inside the backend folder)*
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`

### 3. Add Environment Variables
Scroll down and click **Advanced** or find **Environment Variables** and add the following keys:

| Key | Value | Notes |
|---|---|---|
| `MONGO_URI` | *Your MongoDB Atlas string from Part 1* | Make sure it has your password and `/gharseva` |
| `JWT_SECRET` | `yoursupersecrettokenkey` | A random secure string of letters and numbers |
| `PORT` | `10000` | (Render handles this automatically, but good to add) |
| `EMAIL_HOST` | `smtp.gmail.com` | If you want custom emails working |
| `EMAIL_PORT` | `587` | |
| `EMAIL_USER` | *Your email* | |
| `EMAIL_PASS` | *Your app password* | |
| `EMAIL_FROM` | `GharSeva <your-email>` | |

4. Click **Create Web Service**.
5. Wait for the deploy logs to finish. Once it says "Live", copy your Web Service URL (e.g. `https://gharseva-backend.onrender.com`).

---

# 💾 Part 3 — Seed Your Cloud Database

To make sure your online database has sample categories, services, and default accounts:

1. On your local PC, open your `backend/.env` file.
2. Temporarily change your local `MONGO_URI` to match your new **MongoDB Atlas connection string** (the one you set up in Part 1).
3. Open a Command Prompt in the `backend/` folder and run:
   ```bash
   node seed.js
   ```
4. This command will connect to your MongoDB Atlas database in the cloud and insert all the sample users, categories, and services!
5. Once done, revert your local `backend/.env` back to `mongodb://127.0.0.1:27017/gharseva` so your local tests don't overwrite your cloud database.

---

# 🎨 Part 4 — Deploy the Frontend

You can deploy the frontend on either **Render** or **Netlify**. Choose one of the methods below.

---

## Method A — Deploy on Render (Recommended)

1. In your Render Dashboard, click **New +** and select **Static Site**.
2. Connect your GitHub repository.
3. Configure the following fields:
   - **Name:** `gharseva`
   - **Branch:** `main`
   - **Root Directory:** `frontend` ⚠️ *(Tell Render to look inside the frontend folder)*
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
   - **Instance Type:** `Free`

4. Scroll down and click **Add Environment Variable**:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-backend-url.onrender.com/api` (Replace with the actual backend Web Service URL you copied from Part 2, adding `/api` to the end).

5. Click **Create Static Site**.
6. Once deployed, open your Static Site URL (e.g. `https://gharseva.onrender.com`). Your app is live!

---

## Method B — Deploy on Netlify

Netlify is incredibly fast for frontend React builds.

1. Go to **https://www.netlify.com** and sign up / log in with GitHub.
2. Click **Add new site** → **Import an existing project**.
3. Select **GitHub** and authorize.
4. Select your repository.
5. Configure the following fields:
   - **Branch to deploy:** `main`
   - **Base directory:** `frontend` ⚠️
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist` ⚠️ *(For Netlify, this should point to `frontend/dist` when base directory is set)*

6. Click **Environment Variables** or **Configuration** → **Environment variables**:
   - Add Variable:
     - **Key:** `VITE_API_URL`
     - **Value:** `https://your-backend-url.onrender.com/api` (Your Render Backend URL)

7. Click **Deploy Site**.
8. Go to **Site Configuration** → **Site details** → **Change site name** to give it a custom name (e.g., `gharseva-marketplace.netlify.app`).

---

## ⚠️ Important Post-Deployment Note (Cold Starts)

Because Render's Free tier spins down servers that haven't received traffic in 15 minutes:
- When you open the website after some time, it might take **50–60 seconds** for the backend to wake up.
- This is normal on free-tier hosting! Once it wakes up, the site runs fast.
- If you want to prevent this, you can upgrade Render to a paid starter plan or use a free cron-job site like **https://cron-job.org** to ping your backend URL every 10 minutes to keep it awake.

# 📤 GharSeva — How to Upload to GitHub

> Two methods are explained below. Pick whichever you prefer.

---

## 🔧 Before You Start (Both Methods)

### 1. Create a GitHub Account (if you don't have one)
- Go to **https://github.com** → Click **Sign up** → Follow the steps

### 2. Create a New Repository on GitHub
1. Log in to GitHub
2. Click the **"+"** icon at the top-right → **"New repository"**
3. Fill in:
   - **Repository name:** `GharSeva`
   - **Description:** Local Home Services Marketplace (optional)
   - **Visibility:** Public or Private (your choice)
   - ❌ Do NOT check "Add a README file" (we already have one)
   - ❌ Do NOT check "Add .gitignore"
4. Click **"Create repository"**
5. Copy the repository URL shown — it will look like:
   ```
   https://github.com/your-username/GharSeva.git
   ```

---

---

# 🖱️ Method 1 — Using GitHub Website (No Commands Needed)

> Best if you are not comfortable with the command line.

### Step 1 — Extract the Zip
Extract `GharSeva.zip` to a folder. You will get a `gharseva/` folder.

### Step 2 — Upload Files on GitHub

1. Go to your newly created repository on GitHub
2. You will see a page that says *"Quick setup"*
3. Scroll down and click **"uploading an existing file"** link

   ![GitHub upload link](https://i.imgur.com/example.png)

   *(It's a small link below the big green code button area)*

4. On the upload page, either:
   - **Drag and drop** the entire `gharseva/` folder into the browser window, OR
   - Click **"choose your files"** → navigate to the extracted folder → select all files inside

> ⚠️ **Important:** GitHub does not upload empty folders. If a folder has no files in it, it will be skipped — that is okay.

> ⚠️ **Note:** GitHub has a **25 MB per-file limit** and **100 files per upload limit** via the website.
> If you have more than 100 files, upload in batches:
> - First upload: `backend/` folder contents
> - Second upload: `frontend/src/` folder contents
> - Third upload: remaining files

### Step 3 — Commit the Upload

1. Scroll down after selecting files
2. In the **"Commit changes"** section, write a message like:
   ```
   Initial commit - GharSeva project
   ```
3. Click **"Commit changes"** (green button)

### Step 4 — Done!
Your project is now on GitHub. Share the repository link with your group members.

---

---

# 💻 Method 2 — Using Command Prompt / Terminal (Git Commands)

> Faster and more professional. Recommended if Git is installed.

## Prerequisites
- **Git** must be installed: https://git-scm.com/
- Verify: open Command Prompt and type `git --version`

---

## Step-by-Step

### Step 1 — Extract the Zip
Extract `GharSeva.zip` anywhere on your PC. For example:
```
C:\Projects\gharseva\
```

### Step 2 — Open Command Prompt in the Project Folder

**Option A — Easy way:**
1. Open File Explorer
2. Navigate to the `gharseva/` folder
3. Click the address bar at the top
4. Type `cmd` and press Enter
5. A command prompt opens directly in that folder

**Option B — Manual way:**
```cmd
cd C:\Projects\gharseva
```
*(Replace with your actual path)*

### Step 3 — Initialize Git (if not already done)

Check if git is already initialized (look for a `.git` folder):
```cmd
git status
```

If you see `fatal: not a git repository`, initialize it:
```cmd
git init
```

### Step 4 — Connect to Your GitHub Repository

Copy the URL of the repo you created on GitHub, then run:
```cmd
git remote add origin https://github.com/your-username/GharSeva.git
```
*(Replace `your-username` with your actual GitHub username)*

If you get an error like `remote origin already exists`, run this first:
```cmd
git remote remove origin
git remote add origin https://github.com/your-username/GharSeva.git
```

### Step 5 — Check What Will Be Uploaded

The `.gitignore` file already excludes `node_modules/` and sensitive files. To see what will be uploaded:
```cmd
git status
```

### Step 6 — Stage All Files
```cmd
git add .
```

### Step 7 — Create Your First Commit
```cmd
git commit -m "Initial commit - GharSeva project"
```

### Step 8 — Set Branch Name and Push to GitHub
```cmd
git branch -M main
git push -u origin main
```

### Step 9 — Enter GitHub Credentials (if asked)
- If a login window pops up, sign in with your GitHub account
- If it asks for username/password in terminal:
  - **Username:** your GitHub username
  - **Password:** use a **Personal Access Token** (not your actual password)

#### How to create a Personal Access Token:
1. Go to GitHub → click your profile picture → **Settings**
2. Scroll down → **Developer settings** (left sidebar)
3. **Personal access tokens** → **Tokens (classic)**
4. Click **Generate new token (classic)**
5. Give it a name, set expiry, check **"repo"** scope
6. Click **Generate token** → Copy the token immediately
7. Use this token as your password in the terminal

### Step 10 — Done!

Visit `https://github.com/your-username/GharSeva` to see your uploaded project.

---

## 🔄 How to Update the Repository Later

After making changes to your code, run these 3 commands:
```cmd
git add .
git commit -m "describe what you changed"
git push
```

---

## 📋 Quick Reference — Git Commands

| Command | What it does |
|---------|-------------|
| `git init` | Start tracking a folder with Git |
| `git status` | See which files changed |
| `git add .` | Stage all changes for commit |
| `git commit -m "message"` | Save a snapshot with a label |
| `git remote add origin <url>` | Link to GitHub repository |
| `git push -u origin main` | Upload to GitHub |
| `git push` | Upload future updates |
| `git pull` | Download latest changes from GitHub |
| `git clone <url>` | Download a repo from GitHub to your PC |

---

## ❓ Troubleshooting

### "git is not recognized"
- Git is not installed. Download from: https://git-scm.com/
- After installing, **restart** your Command Prompt

### "Authentication failed"
- Use a Personal Access Token as your password (see Step 9 above)
- Or install **GitHub Desktop** (https://desktop.github.com/) for easier login

### "Updates were rejected"
- The remote has changes you don't have locally. Run:
  ```cmd
  git pull origin main --rebase
  git push
  ```

### "node_modules being uploaded" (takes too long)
- Make sure the `.gitignore` file in the project root exists
- If it doesn't, create one with this content:
  ```
  node_modules/
  .env
  dist/
  ```
  Then run `git add .` and commit again

---

*GharSeva — Local Home Services Marketplace*

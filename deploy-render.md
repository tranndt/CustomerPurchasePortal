## 🚀 Deploy Your Full Docker App to Render (Step-by-### 🚨 Pro Tip: If You're Using Docker Compose

Render's Web Services don't support `docker-compose.yml` directly — only individual services. For this project, we've created a unified `Dockerfile` at the root that combines:

* Django backend (port 8000)
* Express API (port 3030)
* Flask sentiment service (port 5002)
* React frontend (served via Django)

This allows the entire stack to run in a single container, with the main ports being exposed through Render's service.

For the MongoDB database, you'll need to use an external service such as:

* [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (recommended)
* [ScaleGrid](https://scalegrid.io/)
* [mLab](https://mlab.com/)✅ Prerequisites

* A **GitHub repo** with your full project
* A **Dockerfile** at the root (or correct Docker Compose setup)
* Your `.env` is either committed (carefully) or recreated via Render’s dashboard

---

## 🔹 Option A: Deploy Using a `Dockerfile` (Single App Container)

Render supports **Docker-based deploys** easily.

### 🧱 Step 1: Prep Your `Dockerfile`

Make sure it's working locally (it should be, since you said the container is running).

Make sure your Dockerfile:

* **Exposes the correct port** (e.g. `EXPOSE 5002` for Flask or Django, or 3000 for React if separate)
* **Uses CMD or ENTRYPOINT** to run the server (e.g. `gunicorn`, `node`, `python manage.py runserver`, etc.)

---

### 🌐 Step 2: Push Your Repo to GitHub

* Push your project (with the Dockerfile) to GitHub
* Make sure `.dockerignore` and `.env.example` are present

---

### ⚙️ Step 3: Create a Render Web Service

1. Go to [render.com](https://render.com)
2. Click **“New +” → Web Service**
3. Choose your GitHub repo
4. **Environment = Docker**
5. **Port**: Match your app’s `EXPOSE` port (e.g., 5002)
6. **Build Command**: leave blank (Render will use the Dockerfile)
7. **Start Command**: leave blank if it's in your Dockerfile (`CMD` or `ENTRYPOINT`)

---

### 🔐 Step 4: Add Environment Variables

* Go to the “Environment” section on Render dashboard
* Add the key-value pairs from your local `.env`

  * Example: `WATSONX_API_KEY`, `WATSONX_PROJECT_ID`, `DJANGO_SECRET_KEY`, etc.

---

### 🚨 Pro Tip: If You’re Using Docker Compose

Render’s Web Services don’t support `docker-compose.yml` directly — only individual services. You’ll need to **deploy each service (Django, Flask, etc.) as separate web services** or combine them in one container image.

For multi-container setups, you may want:

* Django + React in one image (e.g. served via `gunicorn` and Nginx)
* Flask (sentiment) in a separate microservice
* Mongo (can be self-hosted or external — Render doesn't offer hosted Mongo)

Let me know if you're using Compose and want help collapsing it into a single container.

---

### ✅ Step 5: Set Up MongoDB

Since Render doesn't provide MongoDB hosting, you'll need to set up an external MongoDB service:

1. **Create a MongoDB Atlas account**
   * Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   * Create a free tier cluster
   * Set up network access (whitelist all IPs: `0.0.0.0/0` for testing)
   * Create a database user with read/write access

2. **Get your MongoDB connection string**
   * Should look like: `mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/your-database`
   * Add this connection string to your Render environment variables as `MONGODB_URI`

3. **Update your application to use this connection string**
   * The unified Dockerfile and startup script handle the connection properly

---

### ✅ Step 6: Deploy

* Click **Create Web Service**
* Render will build and deploy your Docker image
* Once deployed, it gives you a public URL (e.g., `https://yourapp.onrender.com`)
* Initialize demo data by accessing: `https://yourapp.onrender.com/djangoapp/api/init-demo-data`

---

### 💡 Bonus: Free Tier Limitations

* Build time: 15-minute cap (our multi-service container might hit this limit)
* Free tier: spins down when idle (first request after idle period will be slow)
* You get free SSL, a domain, and logs
* For production use, upgrade to at least the Standard tier ($7/mo) to avoid spindowns

---

## 📦 Summary

* [x] Unified Dockerfile created (combining Django, Express, Flask and React)
* [x] MongoDB Atlas account set up for database
* [x] GitHub repo pushed with all deployment files
* [x] New Web Service on Render → Docker → port 8000
* [x] Environment variables entered (from `.env.example`)
* [x] App builds and runs on live URL

## 🔐 Handling Sensitive Credentials Securely

When deploying to Render, sensitive information should **never** be committed to your repository or exposed in logs. Follow these guidelines:

### 1. Remove Sensitive Information from Your Repository

* Add the following to `.gitignore`:

  ```gitignore
  # API keys and secrets
  apikey.json
  *.key
  *.pem
  .env
  .env.*
  !.env.example
  credentials/
  ```

* Move real API keys to the `credentials/` directory for local development
* Create example files (like `apikey.example.json`, `.env.example`) without real credentials

### 2. Configure Environment Variables in Render

In your Render dashboard:

1. Go to the "Environment" tab of your service
2. Add the following environment variables:
   * **MongoDB Connection**:
     * Key: `MONGODB_URI`
     * Value: Your full MongoDB connection string
   * **WatsonX API (if applicable)**:
     * Key: `WATSONX_API_KEY`
     * Value: Your actual API key
     * Key: `WATSONX_PROJECT_ID`
     * Value: Your project ID
   * **Django Settings**:
     * Key: `DJANGO_SECRET_KEY`
     * Value: Let Render generate this for you
     * Key: `DEBUG`
     * Value: false

### 3. Avoid Exposing Credentials in Logs

* Avoid printing connection strings or credentials to logs
* In your code, sanitize any output that might contain passwords
* If you need to debug connection issues, log only partial information or mask sensitive parts

This approach keeps your credentials secure while making them available to your application in production.

---

## 🔍 Troubleshooting

* **Build timeouts**: If you hit the 15-minute build cap, consider:
  * Pre-building images and pushing to Docker Hub
  * Simplifying the build process or optimizing Dockerfiles
  * Upgrading to a paid plan

* **MongoDB connection issues**:
  * Verify your connection string is correct
  * Check network access settings in MongoDB Atlas
  * Ensure you've whitelisted Render's IP ranges

* **Service not starting**:
  * Check logs in Render dashboard
  * Verify all environment variables are correctly set
  * Test the Docker build locally before deploying

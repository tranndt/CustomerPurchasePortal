# ElectronicsRetail - Full Stack E-Commerce Application

🌟 **[🚀 LIVE DEMO - Click Here to Access the Application](https://electronicsretail-e-commerce.onrender.com/)** 🌟

> ✅ **Ready to Try - No Setup Required!**  
> 🔐 **Demo Credentials:**
> - **Customer Account:** `demo_customer` / `password123`
> - **Admin Account:** `demo_admin` / `password123`
> - **Support Account:** `demo_support` / `password123`

A comprehensive full-stack web application for electronics retail with product management, customer reviews, sentiment analysis, and user authentication.

**🛠️ Tech Stack:** Django + React + Express + Flask + MongoDB + Docker + Render

## 🎮 Try It Live

### 🔗 **Production Deployment**
**Website:** [https://electronicsretail-e-commerce.onrender.com/](https://electronicsretail-e-commerce.onrender.com/)

### 🎯 **Quick Demo Guide**
1. **Browse Products**: [Shop Page](https://electronicsretail-e-commerce.onrender.com/shop) - View the product catalog
2. **Customer Experience**: Login with `demo_customer` / `password123` to experience shopping features
3. **Admin Dashboard**: Login with `demo_admin` / `password123` to access management tools
4. **Support Portal**: Login with `demo_support` / `password123` to handle customer tickets

### ✨ **Key Features to Try**

- 🛒 **Shopping Cart** - Add products and proceed to checkout
- 📱 **Responsive Design** - Try on mobile and desktop
- 🔍 **Product Search** - Browse by categories
- ⭐ **Review System** - Leave reviews with sentiment analysis
- 🎫 **Support Tickets** - Customer support system
- 📊 **Admin Tools** - Inventory and order management

## �️ Development Setup

### Local Development URLs

- **Main Application:** [http://localhost:8000/](http://localhost:8000/)
- **React Frontend:** [http://localhost:3000](http://localhost:3000)
- **Admin Interface:** [http://localhost:8000/admin/](http://localhost:8000/admin/)

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd xrwvm-fullstack_developer_capstone

# Start all services
docker-compose up -d

# Initialize demo data
curl -X GET http://localhost:8000/djangoapp/api/init-demo-data
```

### Development Mode

```bash
# Start Django backend
cd server
python manage.py runserver

# Start React frontend (new terminal)
cd server/frontend
npm start

# Start Express API (new terminal)
cd server/database
npm start

# Start Flask sentiment service (new terminal)
cd server/djangoapp/microservices
python app.py
```

## 🌐 Access URLs

- **Frontend**: <http://localhost:3000>
- **Django API**: <http://localhost:8000>
- **Express API**: <http://localhost:3030>
- **Flask Service**: <http://localhost:5002>

## 🏗️ Architecture

### Services

- **Django Backend** (8000): Main API server with user auth and business logic
- **React Frontend** (3000): Modern responsive UI
- **Express API** (3030): Product and review data management
- **Flask Service** (5002): Sentiment analysis microservice
- **MongoDB** (27017): Database for products and reviews

### Key Features

- **User Authentication**: Secure login/registration
- **Product Catalog**: Browse electronics inventory
- **Order Management**: Track purchases and history
- **Review System**: Customer reviews with sentiment analysis
- **Support Tickets**: Help desk system with role-based access
- **Admin Dashboard**: Management interface for admins
- **Responsive Design**: Mobile-friendly interface

## 🚀 Deployment on Render

This application can be deployed on [Render](https://render.com) using Docker.

### Steps to Deploy

1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Select "Docker" as the environment
   - Use the main branch for deployment
   - Set the port to 8000 (main Django application port)

2. **Environment Variables**
   - Add all required environment variables from `.env.example`
   - Make sure to set `DEBUG=False` for production
   - Add any necessary API keys

3. **External Services**
   - For MongoDB, you'll need to provision an external MongoDB service like MongoDB Atlas
   - Add the MongoDB connection string as an environment variable

4. **Scaling**
   - Start with the Standard plan for better performance
   - Free tier may experience cold starts that could affect service

### Monitoring

- Use the Render dashboard to monitor logs
- Set up health checks for each service

## 📦 Installation & Setup

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Python 3.10+ (for local development)

### Manual Setup (Development)

1. **Backend Setup**

   ```bash
   cd server
   python -m venv djangoenv
   source djangoenv/bin/activate  # On Windows: djangoenv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

2. **Express Microservice**

   ```bash
   cd server/database
   npm install
   node app.js
   ```

3. **Flask Sentiment Service**

   ```bash
   cd server/djangoapp/microservices
   pip install -r requirements.txt
   python app.py
   ```

4. **React Frontend**

   ```bash
   cd server/frontend
   npm install
   npm run build
   ```

## 🔧 Configuration

The application uses MongoDB for data storage. Sample data is automatically loaded on startup.

### API Keys

For sentiment analysis, the application can use IBM Watson X (with API key) or fall back to VADER (local analysis):

1. **Setting up API Keys**:

   ```bash
   # Store your API key in the credentials folder (gitignored)
   mkdir -p credentials
   cp apikey.example.json credentials/apikey.json
   # Edit the file to include your actual API key
   nano credentials/apikey.json
   ```

2. **Run the setup script** to add API keys to your environment:

   ```bash
   ./setup_api_keys.sh
   ```

3. **Manual Setup**: Alternatively, add to your `.env` file:

   ```bash
   WATSONX_API_KEY=your_api_key_here
   WATSONX_PROJECT_ID=your_project_id
   SERVER_URL=https://us-south.ml.cloud.ibm.com
   ```

> Note: If no API keys are provided, the system falls back to using VADER for sentiment analysis.

## 📱 Usage

### For All Users

- Register and log in to your account
- Browse the electronics product catalog
- View product details, specifications, and customer reviews
- Search for products by name or category

### For Customers

- Add products to your shopping cart and manage cart contents
- Place orders and view your order history
- Submit shopping experience reviews with ratings
- Create and track support tickets for help or issues

### For Administrators

- View and manage all customer orders, including processing and refunds
- Update product inventory, pricing, and categories
- Moderate product reviews and monitor sentiment trends
- Oversee all support tickets and assign or resolve as needed

### For Support Staff

- View and manage all customer support tickets
- Respond to customer inquiries and update ticket statuses
- Escalate complex issues to administrators

## 🔄 Key API Endpoints

### Django API

- `POST /djangoapp/login` - User login
- `POST /djangoapp/register` - User registration
- `GET /djangoapp/api/demo-users` - Get demo users
- `GET /djangoapp/api/customer/orders/` - Get customer orders
- `POST /djangoapp/api/customer/review` - Submit a review

### Express API

- `GET /fetchProducts` - Get products data
- `GET /fetchProduct/{id}` - Get specific product
- `POST /insert_review` - Insert new review

### Flask Sentiment API

- `GET /analyze/{text}` - Analyze sentiment of text

## 🔒 Security Best Practices

### API Keys and Credentials

1. **Never store sensitive information in the repository**
   - API keys, passwords, and connection strings should never be committed to the repository
   - Use environment variables or secret files instead

2. **Use the credentials directory for local development**
   - Store API keys in the `credentials/` directory (which is gitignored)
   - Copy `apikey.example.json` to `credentials/apikey.json` and add your API keys

3. **Use the setup script for local development**
   
   ```bash
   # Set up your API keys for local development
   ./setup_api_keys.sh
   ```

4. **For Render deployment - Using Secret Files (Recommended)**
   - Use Render's "Secret Files" feature for better organization and security
   - Add the following secret files in your Render dashboard:
     - `secrets.env` → Mount at `/etc/secrets/secrets.env`
     - `watsonx.json` → Mount at `/etc/secrets/watsonx.json`
   - The application will automatically load these files at startup
   - See [RENDER_SECRET_FILES.md](docs_backup/RENDER_SECRET_FILES.md) for detailed setup instructions

5. **Alternative: Using Environment Variables in Render**
   - Add sensitive environment variables in the Render dashboard
   - Required variables:
     - `MONGODB_URI` - Your MongoDB connection string
     - `WATSONX_API_KEY` - Your WatsonX API key (if using Watson)
     - `DJANGO_SECRET_KEY` - Will be auto-generated by Render

For more details, see [SECURITY_CREDENTIALS.md](docs_backup/SECURITY_CREDENTIALS.md).

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

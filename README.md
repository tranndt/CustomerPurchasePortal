# ElectronicsRetail - Full Stack E-Commerce Application

A comprehensive full-stack web application for electronics retail with product management, customer reviews, sentiment analysis, and user authentication.

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

## 👤 Demo Users

| Username | Password | Role |
|----------|----------|------|
| demo_customer | password123 | Customer |
| demo_admin | password123 | Admin |
| demo_support | password123 | Support |

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

For detailed deployment instructions, see [deploy-render.md](deploy-render.md).

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

## 📱 Usage

### User Authentication

1. Register a new account or login with existing credentials
2. Navigate through the application as an authenticated user

### Browsing Products

1. View the list of available products
2. Click on a product to see details and reviews

### Submitting Reviews

1. Login to your account
2. Navigate to a product page
3. Fill out the review form with review text and rating
4. Submit the review for automatic sentiment analysis

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

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

# Customer Purchase Portal - Full Stack E-Commerce Application

A comprehensive full-stack web application for customer purchase management with product reviews, sentiment analysis, and user authentication.

## 🚀 Features

- **User Authentication**: Secure login and registration system
- **Product Management**: Browse and view product information
- **Order Management**: Track customer orders and purchase history
- **Review System**: Submit and view customer reviews with sentiment analysis
- **Support Tickets**: Customer support ticket system
- **Sentiment Analysis**: AI-powered sentiment analysis using IBM Watson or VADER
- **Responsive Design**: Mobile-friendly React frontend with Bootstrap styling

## 🏗️ Architecture

This application follows a microservices architecture with the following components:

### Backend Services
- **Django Backend** (Port 8000): Main application server and API
- **Express.js API** (Port 3030): Node.js microservice for data management
- **Flask Sentiment Service** (Port 5002): Python microservice for sentiment analysis
- **MongoDB** (Port 27017): NoSQL database for storing product and review data

### Frontend
- **React Application**: Modern, responsive user interface
- **Static HTML Pages**: Additional static pages for authentication

## 🛠️ Technology Stack

### Backend
- **Python Django**: Web framework and main API server
- **Node.js/Express**: Microservice for data management
- **Flask**: Sentiment analysis microservice
- **MongoDB**: Document database
- **IBM Watson AI** / **VADER**: Sentiment analysis

### Frontend
- **React.js**: Component-based UI framework
- **Bootstrap**: CSS framework for responsive design
- **HTML/CSS/JavaScript**: Static pages and styling

### DevOps
- **Docker & Docker Compose**: Containerization and orchestration
- **Gunicorn**: Python WSGI HTTP Server

## 📦 Installation & Setup

### Prerequisites
- Docker and Docker Compose
- Node.js (for local development)
- Python 3.10+ (for local development)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/tranndt/CustomerPurchasePortal.git
   cd CustomerPurchasePortal
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Main Application: http://localhost:8000
   - Express API: http://localhost:3030
   - Flask Sentiment Service: http://localhost:5002
   - MongoDB: localhost:27017

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

### Environment Variables

Create a `.env` file in the sentiment service directory:

```env
WATSONX_API_KEY=your_watson_api_key
WATSONX_PROJECT_ID=your_project_id
SERVER_URL=your_watson_server_url
```

### Database Configuration

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
3. Fill out the review form with:
   - Review text
   - Product rating
   - Purchase information
   - Purchase date
4. Submit the review for automatic sentiment analysis

### Viewing Reviews
- Reviews are displayed with sentiment indicators (positive, negative, neutral)
- Each review shows product information and purchase details

## 🤖 Sentiment Analysis

The application includes two sentiment analysis implementations:

1. **IBM Watson AI**: Advanced AI-powered sentiment analysis
2. **VADER Sentiment**: Fallback sentiment analysis for reliability

Reviews are automatically analyzed when submitted, and results are stored and displayed with visual indicators.

## 🐳 Docker Services

The application runs in four Docker containers:

- **Django**: Main web application and API
- **Express**: Node.js microservice for product data
- **Flask**: Python sentiment analysis service
- **MongoDB**: Database server

## 🔄 API Endpoints

### Django API
- `GET /djangoapp/api/customer/orders/` - Get customer orders
- `GET /djangoapp/api/customer/reviews/` - Get customer reviews
- `GET /djangoapp/api/customer/tickets/` - Get customer support tickets
- `POST /djangoapp/api/customer/review` - Submit a review
- `POST /djangoapp/api/customer/support/new` - Submit a support ticket
- `POST /djangoapp/login` - User login
- `POST /djangoapp/register` - User registration

### Express API
- `GET /fetchProducts` - Get products data
- `GET /fetchProduct/{id}` - Get specific product
- `POST /insert_review` - Insert new review

### Flask Sentiment API
- `GET /` - Service health check
- `GET /analyze/{text}` - Analyze sentiment of text

## 🧪 Testing

### Manual Testing
Test the sentiment analysis service:
```bash
curl "http://localhost:5002/analyze/This car is amazing"
```

Test review submission:
```bash
curl -X POST "http://localhost:8000/djangoapp/api/customer/review" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "review": "Great service and excellent product!",
    "product": "Premium Membership",
    "rating": 5,
    "purchase": true,
    "purchase_date": "2024-01-15"
  }'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- IBM Developer Skills Network for the original capstone project structure
- React and Django communities for excellent documentation
- Bootstrap for responsive design components

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

**Note**: This is a demonstration project showcasing full-stack development skills with microservices architecture, sentiment analysis, and modern web technologies.
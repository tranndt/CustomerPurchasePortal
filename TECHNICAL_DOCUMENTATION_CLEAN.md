# Technical Documentation: Fullstack Developer Capstone

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Backend Components](#backend-components)
3. [Frontend Components](#frontend-components)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Authentication & Authorization](#authentication--authorization)
7. [Deployment Configuration](#deployment-configuration)

---

## Architecture Overview

### System Architecture

The application follows a client-server architecture with:

- **Frontend**: React.js SPA (Single Page Application)
- **Backend**: Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production)
- **Microservices**: Flask-based sentiment analysis service
- **Containerization**: Docker with Docker Compose

### Technology Stack

- **Frontend**: React 18, React Router, CSS3, JavaScript ES6+
- **Backend**: Django 4.x, Django REST Framework, Python 3.10
- **Database**: SQLite, Django ORM
- **Microservices**: Flask, Python
- **Deployment**: Docker, Docker Compose
- **Development Tools**: npm, pip, Django management commands

---

## Backend Components

### 1. Models (`djangoapp/models.py`)

#### UserProfile Model

```python
class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('customer', 'Customer'), 
        ('manager', 'Manager'),
        ('admin', 'Admin'),
        ('support', 'Support')
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
```

**Features:**

- Extends Django's built-in User model
- Role-based access control
- One-to-one relationship with User

#### Product Model

```python
class Product(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    stock_quantity = models.IntegerField(default=0)
    image_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

**Features:**

- Complete product information management
- Stock tracking with `is_in_stock` property
- Soft deletion with `is_active` flag
- Timestamp tracking

#### Order Model

```python
class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'), 
        ('rejected', 'Rejected'),
        ('fulfilled', 'Fulfilled'),
        ('cancelled', 'Cancelled')
    ]
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
```

**Features:**

- Order lifecycle management
- Transaction tracking
- Customer-product relationship
- Order status workflow

#### Review Model

```python
class Review(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    rating = models.IntegerField()
    comment = models.TextField()
    sentiment = models.CharField(max_length=10, default='neutral')
    date = models.DateTimeField(auto_now_add=True)
```

**Features:**

- Product reviews with ratings
- Sentiment analysis integration
- Optional product association
- Timestamp tracking

#### CartItem Model

```python
class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
```

**Features:**

- Shopping cart functionality
- User-specific cart items
- Quantity management
- Persistence across sessions

### 2. Views (`djangoapp/views.py`)

#### Authentication Views

- `login_user`: Handles user authentication with role-based response
- `logout_user`: Session cleanup and logout
- `registration`: User registration with profile creation

#### Product Views

- `get_products`: Paginated product listing with filtering
- `get_product_categories`: Category enumeration
- `get_product_detail`: Individual product information

#### Cart Views

- `get_cart`: User's cart items retrieval
- `update_cart`: Add/update cart items
- `remove_from_cart`: Remove specific items
- `checkout`: Cart processing and order creation

#### Order Views

- `get_orders`: User's order history
- `get_all_orders`: Admin order management
- `update_order_status`: Order fulfillment workflow

#### Review Views

- `submit_review`: Review submission with sentiment analysis
- `get_reviews`: Product/user reviews retrieval
- `get_all_reviews`: Admin review management

### 3. Management Commands

#### load_products

```python
def handle(self, *args, **options):
    # Load products from CSV with BOM handling
    # Populate missing fields with realistic data
    # Create product instances with validation
```

**Features:**

- CSV parsing with BOM character handling
- Automatic field population for missing data
- Validation and error handling
- Database transaction safety

#### list_products

```python
def handle(self, *args, **options):
    # Display all products with formatting
    # Show key product information
    # Provide summary statistics
```

**Features:**

- Formatted product listing
- Stock status indicators
- Category grouping
- Summary statistics

#### check_products

```python
def handle(self, *args, **options):
    # Validate product data integrity
    # Check for missing fields
    # Provide quality metrics
```

**Features:**

- Data quality validation
- Missing field detection
- Statistical analysis
- Health check reporting

---

## Frontend Components

### 1. App Component (`App.js`)

#### Routing Configuration

```jsx
<Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/shop" element={<Shop />} />
  <Route path="/product/:productId" element={<ProductDetail />} />
  <Route path="/login" element={<LoginPanel />} />
  <Route path="/register" element={<Register />} />
  <Route path="/customer/home" element={<CustomerHome />} />
  <Route path="/admin/home" element={<AdminHome />} />
  <Route path="/support/home" element={<SupportHome />} />
</Routes>
```

**Features:**

- Single Page Application routing
- Role-based route protection
- Dynamic parameter handling
- Protected route implementation

### 2. Landing Component (`Landing/Landing.jsx`)

#### Implementation Details

```jsx
const Landing = () => {
  const navigate = useNavigate();
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'stretch',
      color: 'white'
    }}>
      {/* Branding and navigation sections */}
    </div>
  );
};
```

**Features:**

- Responsive landing page design
- Brand presentation
- Navigation to main application areas
- Gradient background styling
- Mobile-responsive layout

### 3. Shop Component (`Shop/Shop.jsx`)

#### State Management

```jsx
const [products, setProducts] = useState([]);
const [categories, setCategories] = useState([]);
const [cartItems, setCartItems] = useState([]);
const [selectedCategory, setSelectedCategory] = useState('');
const [searchTerm, setSearchTerm] = useState('');
const [activeTab, setActiveTab] = useState('browse');
const [currentPage, setCurrentPage] = useState(1);
```

#### Key Features

- **Product Browsing**: Grid-based product display with pagination
- **Category Filtering**: Dynamic category-based filtering
- **Search Functionality**: Real-time product search
- **Cart Management**: Add/remove items, quantity control
- **Responsive Design**: Mobile-first approach

#### API Integration

```jsx
const products_url = "http://localhost:8000/djangoapp/api/products";
const categories_url = "http://localhost:8000/djangoapp/api/products/categories";
const cart_url = "http://localhost:8000/djangoapp/api/cart";
```

#### Styling (`Shop/Shop.css`)

```css
.product-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 15px;
}

.product-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 400px;
}
```

**Features:**

- Square image aspect ratio
- Hover effects and transitions
- Responsive grid layout
- Card-based design
- Status indicators

### 4. Authentication Components

#### Login Component (`Login/Login.jsx`)

**Features:**

- Username/password authentication
- Role-based redirection
- Error handling and validation
- Session management

#### Register Component (`Register/Register.jsx`)

**Features:**

- User registration form
- Profile creation
- Input validation
- Success/error feedback

### 5. Cart Component (`Cart/Cart.jsx`)

**Features:**

- Cart item display
- Quantity management
- Price calculation
- Checkout process
- Empty cart handling

### 6. Product Detail Component (`ProductDetail/ProductDetail.jsx`)

**Features:**

- Detailed product information
- Image gallery
- Add to cart functionality
- Reviews display
- Related products

### 7. Administrative Components

#### AdminHome Component

**Features:**

- Dashboard overview
- Administrative navigation
- User management access
- System statistics

#### InventoryManagement Component

**Features:**

- Product inventory tracking
- Stock level management
- Product editing
- Inventory reports

#### OrderFulfillment Component

**Features:**

- Order processing
- Status updates
- Fulfillment tracking
- Customer communication

---

## API Endpoints

### Authentication Endpoints

- `POST /djangoapp/login/` - User authentication
- `POST /djangoapp/logout/` - Session termination
- `POST /djangoapp/register/` - User registration

### Product Endpoints

- `GET /djangoapp/api/products/` - Product listing with pagination
- `GET /djangoapp/api/products/categories/` - Category enumeration
- `GET /djangoapp/api/products/{id}/` - Product detail

### Cart Endpoints

- `GET /djangoapp/api/cart/` - User's cart items
- `POST /djangoapp/api/cart/update/` - Add/update cart items
- `DELETE /djangoapp/api/cart/remove/` - Remove cart items
- `POST /djangoapp/api/cart/checkout/` - Process checkout

### Order Endpoints

- `GET /djangoapp/api/orders/` - User's order history
- `GET /djangoapp/api/orders/all/` - All orders (admin)
- `POST /djangoapp/api/orders/update/` - Update order status

### Review Endpoints

- `POST /djangoapp/api/reviews/` - Submit product review
- `GET /djangoapp/api/reviews/` - Get reviews
- `GET /djangoapp/api/reviews/all/` - All reviews (admin)

---

## Database Schema

### Tables Structure

1. **auth_user**: Django's built-in user table
2. **djangoapp_userprofile**: User role management
3. **djangoapp_product**: Product catalog
4. **djangoapp_order**: Order management
5. **djangoapp_review**: Product reviews
6. **djangoapp_cartitem**: Shopping cart
7. **djangoapp_supportticket**: Customer support

### Relationships

- User → UserProfile (1:1)
- User → Order (1:N)
- User → Review (1:N)
- User → CartItem (1:N)
- Product → Order (1:N)
- Product → Review (1:N)
- Product → CartItem (1:N)

---

## Authentication & Authorization

### Role-Based Access Control

- **Customer**: Shopping, orders, reviews
- **Manager**: Order management, customer service
- **Admin**: Full system access, user management
- **Support**: Customer service, ticket management

### Protected Routes

- Frontend: `ProtectedRoute` component
- Backend: `@login_required` decorator
- API: Session-based authentication

---

## Deployment Configuration

### Docker Configuration

```dockerfile
# Django Backend
FROM python:3.10
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: ./server
    ports:
      - "8000:8000"
  frontend:
    build: ./server/frontend
    ports:
      - "3000:3000"
  sentiment-service:
    build: ./sentiment_service
    ports:
      - "5000:5000"
```

### Environment Configuration

- Development: SQLite, DEBUG=True
- Production: PostgreSQL, DEBUG=False
- Environment variables for sensitive data

---

## Development Workflow

### Setup Commands

```bash
# Backend setup
cd server
python -m venv djangoenv
source djangoenv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py load_products

# Frontend setup
cd frontend
npm install
npm start
```

### Management Commands

```bash
# Load products from CSV
python manage.py load_products --clear-existing

# Check product data quality
python manage.py check_products

# List all products
python manage.py list_products
```

### Development Servers

- Django: `python manage.py runserver` (Port 8000)
- React: `npm start` (Port 3000)
- Sentiment Service: `python server.py` (Port 5000)

---

## Testing & Quality Assurance

### Backend Testing

- Unit tests for models and views
- API endpoint testing
- Database integrity checks

### Frontend Testing

- Component testing with React Testing Library
- Integration testing
- End-to-end testing

### Code Quality

- ESLint for JavaScript
- Flake8 for Python
- CSS validation
- Security audits

---

## Performance Optimization

### Backend Optimization

- Database query optimization
- API response caching
- Image optimization
- Static file serving

### Frontend Optimization

- Code splitting
- Lazy loading
- Image optimization
- Bundle size optimization

---

## Security Considerations

### Authentication Security

- Session-based authentication
- CSRF protection
- Password hashing
- Role-based access control

### Data Security

- Input validation
- SQL injection prevention
- XSS protection
- Secure API endpoints

---

## Monitoring & Logging

### Application Monitoring

- Django logging configuration
- Error tracking
- Performance monitoring
- User activity tracking

### System Monitoring

- Server health checks
- Database performance
- API response times
- Resource utilization

---

This technical documentation provides a comprehensive overview of all components, features, and implementation details of the fullstack developer capstone project.

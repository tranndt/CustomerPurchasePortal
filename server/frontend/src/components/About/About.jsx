import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer/Footer';
import './About.css';

const About = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const techStack = [
    {
      category: "Frontend",
      technologies: [
        "React 18.2+ with Hooks",
        "React Router DOM for routing",
        "CSS3 with modern grid/flexbox",
        "Custom responsive design",
        "Context API for state management"
      ]
    },
    {
      category: "Backend",
      technologies: [
        "Django 4.x REST Framework",
        "Python 3.12 with async support",
        "SQLite database with migrations",
        "JWT authentication system",
        "Custom middleware and decorators"
      ]
    },
    {
      category: "APIs & Services",
      technologies: [
        "Express.js microservice",
        "MongoDB for product data",
        "Flask sentiment analysis service",
        "IBM Watson X integration",
        "RESTful API design patterns"
      ]
    },
    {
      category: "DevOps & Deployment",
      technologies: [
        "Docker containerization",
        "Render cloud deployment",
        "Environment-based configuration",
        "Automated CI/CD pipeline",
        "Secret management system"
      ]
    }
  ];

  const features = [
    {
      title: "User Authentication",
      description: "Secure login system with role-based access control (Customer, Admin, Support)",
      icon: "🔐"
    },
    {
      title: "Product Catalog",
      description: "Dynamic product listing with search, filtering, and detailed product pages",
      icon: "📱"
    },
    {
      title: "Shopping Cart",
      description: "Full cart functionality with add, update, remove operations and checkout",
      icon: "🛒"
    },
    {
      title: "Order Management",
      description: "Complete order lifecycle from placement to fulfillment tracking",
      icon: "📦"
    },
    {
      title: "Admin Dashboard",
      description: "Comprehensive admin interface for inventory, orders, and user management",
      icon: "👨‍💼"
    },
    {
      title: "Customer Support",
      description: "Integrated ticketing system with sentiment analysis for customer feedback",
      icon: "🎧"
    },
    {
      title: "Review System",
      description: "Product reviews with sentiment analysis and moderation capabilities",
      icon: "⭐"
    },
    {
      title: "Responsive Design",
      description: "Mobile-first design that works seamlessly across all devices",
      icon: "📱"
    }
  ];

  return (
    <div className="about-page">
      {/* Navigation */}
      <nav className="about-nav">
        <div className="nav-brand" onClick={() => navigate('/')}>
          ElectronicsRetail™
        </div>
        <div className="nav-links">
          <div className="nav-link" onClick={() => navigate('/')}>Home</div>
          <div className="nav-link" onClick={() => navigate('/shop')}>Shop</div>
          <div className="nav-link active">About</div>
          <div className="nav-link nav-button" onClick={() => navigate('/login')}>Login</div>
        </div>
      </nav>

      <div className={`about-content ${loaded ? 'loaded' : ''}`}>
        {/* Hero Section */}
        <section className="about-hero">
          <div className="hero-content">
            <h1>About ElectronicsRetail™</h1>
            <p className="hero-subtitle">
              A comprehensive full-stack e-commerce demonstration platform showcasing modern web development practices
            </p>
          </div>
        </section>

        {/* Demo Notice */}
        <section className="demo-notice">
          <div className="notice-content">
            <h2>🚨 Demo Website Notice</h2>
            <p>
              This is a <strong>demonstration e-commerce platform</strong> built for educational and portfolio purposes. 
              No real transactions are processed, and no actual products are sold. All data is for demonstration only.
            </p>
          </div>
        </section>

        {/* Project Overview */}
        <section className="project-overview">
          <div className="container">
            <h2>Project Overview</h2>
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Purpose</h3>
                <p>
                  ElectronicsRetail™ was developed as a capstone project to demonstrate proficiency in 
                  full-stack web development, showcasing the integration of multiple technologies and 
                  modern development practices.
                </p>
              </div>
              <div className="overview-card">
                <h3>Architecture</h3>
                <p>
                  Built using a microservices architecture with Django REST API backend, React frontend, 
                  Express.js data service, and Flask sentiment analysis service, all containerized and 
                  deployed on Render.
                </p>
              </div>
              <div className="overview-card">
                <h3>Key Features</h3>
                <p>
                  Complete e-commerce functionality including user authentication, product management, 
                  shopping cart, order processing, admin dashboard, and customer support system.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <h2>Platform Features</h2>
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="tech-stack">
          <div className="container">
            <h2>Technology Stack</h2>
            <div className="tech-grid">
              {techStack.map((category, index) => (
                <div key={index} className="tech-category">
                  <h3>{category.category}</h3>
                  <ul>
                    {category.technologies.map((tech, techIndex) => (
                      <li key={techIndex}>{tech}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Developer Info */}
        <section className="developer-info">
          <div className="container">
            <h2>About the Developer</h2>
            <div className="developer-card">
              <div className="developer-content">
                <h3>Jase Tran</h3>
                <p className="developer-title">Full-Stack Developer</p>
                <p className="developer-description">
                  Passionate about building scalable web applications and exploring new technologies. 
                  This project demonstrates expertise in modern web development, from database design 
                  to deployment and DevOps practices.
                </p>
                <div className="developer-skills">
                  <span className="skill-tag">Python</span>
                  <span className="skill-tag">JavaScript</span>
                  <span className="skill-tag">React</span>
                  <span className="skill-tag">Django</span>
                  <span className="skill-tag">Node.js</span>
                  <span className="skill-tag">Docker</span>
                  <span className="skill-tag">Cloud Deployment</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Credentials */}
        <section className="demo-credentials">
          <div className="container">
            <h2>Try the Demo</h2>
            <p>Use these demo accounts to explore the platform:</p>
            <div className="credentials-grid">
              <div className="credential-card">
                <h3>👤 Customer Account</h3>
                <p><strong>Username:</strong> demo_customer</p>
                <p><strong>Password:</strong> password123</p>
                <p>Access shopping features, place orders, and manage account</p>
              </div>
              <div className="credential-card">
                <h3>👨‍💼 Admin Account</h3>
                <p><strong>Username:</strong> demo_admin</p>
                <p><strong>Password:</strong> password123</p>
                <p>Access admin dashboard, manage inventory, and process orders</p>
              </div>
              <div className="credential-card">
                <h3>🎧 Support Account</h3>
                <p><strong>Username:</strong> demo_support</p>
                <p><strong>Password:</strong> password123</p>
                <p>Access support dashboard and manage customer tickets</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="cta-section">
          <div className="container">
            <h2>Explore the Platform</h2>
            <p>Experience the full functionality of this modern e-commerce platform</p>
            <div className="cta-buttons">
              <button className="cta-button primary" onClick={() => navigate('/shop')}>
                Browse Products
              </button>
              <button className="cta-button secondary" onClick={() => navigate('/login')}>
                Login to Demo
              </button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default About;

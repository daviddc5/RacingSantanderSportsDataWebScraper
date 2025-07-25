# 🚀 FastAPI + Supabase Boilerplate

A modern, production-ready FastAPI boilerplate with Supabase integration, featuring proper async support, dependency injection, comprehensive error handling, and structured logging.

## ✨ Features

### 🏗️ **Architecture**
- **Clean Architecture** with separated concerns (controllers, services, models)
- **Dependency Injection** using FastAPI's built-in DI system
- **Async/Await** with proper thread pool execution for Supabase operations
- **Structured Error Handling** with request ID tracing
- **Comprehensive Logging** with contextual information

### 🔧 **Technical Features**
- **Database-Level Pagination** for efficient data retrieval
- **Flexible Filtering** with support for multiple operators (`ilike`, `gte`, `lte`, etc.)
- **Consistent Response Format** across all endpoints
- **CORS Support** for cross-origin requests
- **Request ID Tracing** for distributed system debugging
- **Health Check Endpoints** for monitoring

### 🛠️ **API Endpoints**
- **CRUD Operations** for items management
- **Advanced Search** with partial matching and price range filtering
- **Pagination Support** on all list endpoints
- **Interactive Documentation** with Swagger UI and ReDoc

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Poetry (recommended) or pip
- Supabase account and project

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd fast-api-playground
```

### 2. Install Dependencies
```bash
# If you have Poetry available
poetry install

# Or with pip using existing requirements
pip install -r requirements.txt

# Or using conda/mamba (if that's your setup)
conda install --file requirements.txt
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
# SUPABASE_PROJECT_URL=https://your-project.supabase.co
# SUPABASE_API_KEY=your-anon-key
```

### 4. Database Setup
1. Go to your Supabase dashboard → SQL Editor
2. Copy and paste the content of `setup_db.sql`
3. Execute the script to create tables and sample data

### 5. Run the Application
```bash
# If you have Poetry available (as you're using)
poetry run python run.py

# Or direct Python execution
python run.py

# Or using uvicorn directly
uvicorn main:app --reload

# Enhanced startup with environment control
python run.py
```

### 6. Explore the API
- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/api/v1/health

## 📚 API Documentation

### Core Endpoints

#### Items Management
```
GET    /api/v1/items/              # List all items (with pagination)
POST   /api/v1/items/              # Create new item
GET    /api/v1/items/{id}          # Get specific item
PUT    /api/v1/items/{id}          # Update item
DELETE /api/v1/items/{id}          # Delete item
```

#### Search & Filtering
```
GET    /api/v1/items/search/              # General search
GET    /api/v1/items/search/offers        # Items on offer
GET    /api/v1/items/search/name/{name}   # Search by name
GET    /api/v1/items/search/price-range/  # Price range filtering
```

#### System
```
GET    /api/v1/health/     # Health check
GET    /api/v1/health/ready # Readiness check
```

### Example Requests

**Create Item:**
```bash
curl -X POST "http://localhost:8000/api/v1/items/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Coffee Mug",
    "price": 12.99,
    "is_offer": false
  }'
```

**Search Items:**
```bash
curl "http://localhost:8000/api/v1/items/search/?q=coffee&skip=0&limit=10"
```

**Price Range Filter:**
```bash
curl "http://localhost:8000/api/v1/items/search/price-range/?min_price=10&max_price=50"
```

## 🏗️ Project Structure

```
├── controllers/           # API route handlers
│   ├── __init__.py
│   ├── health_controller.py
│   └── items_controller.py
├── middleware/           # Custom middleware
│   ├── __init__.py
│   ├── cors.py
│   ├── error_handling.py
│   └── logging.py
├── models/              # Pydantic models
│   ├── __init__.py
│   └── item.py
├── services/            # Business logic
│   ├── __init__.py
│   ├── db_service.py
│   └── items_service.py
├── config.py            # Configuration settings
├── dependencies.py      # Dependency injection
├── main.py             # FastAPI application
├── run.py              # Enhanced startup script
├── setup_db.sql        # Database schema
├── pyproject.toml      # Poetry dependencies & config
├── poetry.lock         # Locked dependency versions
└── .env.example        # Environment variables template
```

## 🔧 Configuration

### Environment Variables
```bash
# Required
SUPABASE_PROJECT_URL=https://your-project.supabase.co
SUPABASE_API_KEY=your-anon-key

# Optional
HOST=0.0.0.0
PORT=8000
RELOAD=true
LOG_LEVEL=info
```

### Database Schema
The project includes a complete database schema (`setup_db.sql`) with:
- Items table with proper constraints
- Performance indexes
- Sample data for testing

## 🧪 Testing

### Manual Testing
Visit the interactive API documentation at `http://localhost:8000/docs` to test all endpoints.

### Health Checks
- `GET /api/v1/health/` - Basic health check
- `GET /api/v1/health/ready` - Readiness check with dependencies

## 🚀 Production Deployment

### Environment Setup
1. Set `RELOAD=false` in production
2. Configure proper logging levels (e.g., `LOG_LEVEL=warning`)
3. Use environment-specific `.env` files
4. Set up proper database credentials
5. Use Poetry for consistent dependency management

### Running in Production
```bash
# Set production environment variables in .env:
# RELOAD=false
# LOG_LEVEL=warning

# Then run the application
poetry run python run.py

# Or if not using Poetry
python run.py
```

### Docker (Poetry-based)
```dockerfile
FROM python:3.9-slim

# Install Poetry
RUN pip install poetry

# Configure Poetry
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VENV_IN_PROJECT=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

WORKDIR /app

# Copy Poetry files
COPY pyproject.toml poetry.lock ./

# Install dependencies
RUN poetry install --without dev && rm -rf $POETRY_CACHE_DIR

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["poetry", "run", "python", "run.py"]
```

### Docker (Traditional pip-based)
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["python", "run.py"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📈 Architecture & Design Decisions

This boilerplate incorporates several production-ready architectural patterns and optimizations:

### **Proper Async Support**
Many FastAPI applications claim to be async but still block the event loop with synchronous database operations. This boilerplate implements true async patterns by using thread pool executors for Supabase operations. When you make a database call, it runs in a separate thread, allowing the main event loop to handle other requests concurrently. This dramatically improves performance under load, especially for I/O-bound operations like database queries.

### **Centralized Logging with Request Tracing**
Rather than scattered print statements, this boilerplate implements structured logging with contextual information. Each request gets a unique request ID that's traced through the entire request lifecycle - from the initial HTTP request, through middleware, controllers, services, and any errors. This makes debugging distributed systems much easier, as you can trace exactly what happened during a specific request by searching logs for the request ID.

### **Flexible Filtering System**
Instead of basic string matching, the search system supports multiple operators (`ilike` for case-insensitive partial matches, `gte`/`lte` for range queries, etc.). This allows for sophisticated search capabilities like "find items with prices between $10-$50" or "find items whose names contain 'coffee' (case-insensitive)". The filtering logic is centralized in the service layer, making it reusable and testable.

### **Consistent API Response Format**
All endpoints return responses in a standardized format with consistent fields like `data`, `message`, `request_id`, and `timestamp`. This eliminates the guesswork for frontend developers and API consumers - they always know what structure to expect. Error responses follow the same pattern, making error handling predictable and uniform across the entire API.

### **Database-Level Pagination**
Rather than loading all records into memory and then slicing them (which is memory-intensive and slow), pagination is handled at the database level using `LIMIT` and `OFFSET` clauses. This means whether you're paginating through 100 items or 1 million items, the performance remains consistent and memory usage stays low.

### **Dependency Injection Architecture**
The application uses FastAPI's built-in dependency injection system to provide clean separation of concerns. Database connections, services, and other dependencies are injected into route handlers rather than being imported directly. This makes the code more testable (you can easily mock dependencies), more maintainable (changing a service implementation doesn't require updating every controller), and follows SOLID principles for better software design.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) for the amazing framework
- [Supabase](https://supabase.com/) for the backend-as-a-service platform
- [Pydantic](https://pydantic-docs.helpmanual.io/) for data validation

---

**Happy coding! 🚀** 
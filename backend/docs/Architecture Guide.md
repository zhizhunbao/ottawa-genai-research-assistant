# 🏗️ Ottawa GenAI Research Assistant - Architecture Guide

## 📊 Project Architecture Overview

This project adopts a layered architecture design to ensure code maintainability, testability, and scalability. The system starts with simple JSON file storage and can seamlessly migrate to complex database systems.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Layer (React/Streamlit)             │
│                      User Interface & Interaction               │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP/REST API
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Layer (FastAPI)                        │
│                   - HTTP endpoint management                   │
│                   - Request/Response validation                │
│                   - Authentication & Authorization             │
│                   - Error handling & responses                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Function calls
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Service Layer                               │
│                   - Business logic implementation              │
│                   - Data transformation processing             │
│                   - Process orchestration management           │
│                   - Error handling & logging                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Data operations
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Repository Layer                              │
│                   - Data access abstraction                    │
│                   - CRUD operations implementation             │
│                   - Query method encapsulation                 │
│                   - Model conversion handling                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │ File operations
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Storage Layer (monk/ directory)                │
│                   - JSON file storage                          │
│                   - Document file management                   │
│                   - Simple file system                         │
│                   - Easy backup & migration                    │
└─────────────────────────────────────────────────────────────────┘
```

## 🗂️ Directory Structure Details

```
backend/
├── app/                   # Application core
│   ├── api/              # API layer - FastAPI route endpoints
│   │   ├── __init__.py
│   │   ├── chat.py       # Chat conversation interface
│   │   ├── documents.py  # Document management interface
│   │   ├── reports.py    # Report generation interface
│   │   ├── users.py      # User management interface
│   │   └── settings.py   # System settings interface
│   ├── core/             # Core configuration & utilities
│   │   ├── __init__.py
│   │   ├── config.py     # Configuration management
│   │   └── security.py   # Security authentication
│   ├── models/           # Pydantic data models
│   │   ├── __init__.py
│   │   ├── user.py       # User data model
│   │   ├── document.py   # Document data model
│   │   ├── report.py     # Report data model
│   │   └── chat.py       # Chat data model
│   ├── repositories/     # Repository layer - Data access
│   │   ├── __init__.py
│   │   ├── base.py       # Base repository class
│   │   ├── user_repository.py      # User repository
│   │   ├── document_repository.py  # Document repository
│   │   ├── report_repository.py    # Report repository
│   │   └── chat_repository.py      # Chat repository
│   ├── services/         # Service layer - Business logic
│   │   ├── __init__.py
│   │   ├── user_service.py         # User service
│   │   ├── document_service.py     # Document service
│   │   ├── report_service.py       # Report service
│   │   └── chat_service.py         # Chat service
│   └── main.py          # FastAPI application entry
├── monk/                # Data storage directory
│   ├── users/          # User data
│   │   └── users.json
│   ├── documents/      # Document data
│   │   └── documents.json
│   ├── reports/        # Report data
│   │   └── reports.json
│   ├── chats/          # Chat records
│   │   └── chats.json
│   └── system/         # System configuration
│       └── settings.json
├── uploads/            # File upload directory
├── docs/              # Project documentation
└── tests/             # Test code
```

## 🔄 Data Flow Example

### Complete User Creation Flow:

#### 1. **API Layer Processing** (`/api/users.py`)
```python
@router.post("/", response_model=User)
async def create_user(user_data: UserCreate):
    """Create new user"""
    user_service = UserService()
    return await user_service.create_user(**user_data.dict())
```

#### 2. **Service Layer Business Logic** (`UserService`)
```python
async def create_user(self, username: str, email: str, role: str = "user"):
    """User creation business logic"""
    # Data validation
    if await self.user_repo.find_by_email(email):
        raise ValueError("Email already exists")
    
    # Create user model
    user = User(
        id=str(uuid4()),
        username=username,
        email=email,
        role=role,
        created_at=datetime.now(),
        is_active=True
    )
    
    # Save user
    return self.user_repo.create(user)
```

#### 3. **Repository Layer Data Access** (`UserRepository`)
```python
def create(self, user: User) -> User:
    """Save user to JSON file"""
    data = self._load_data()
    data.append(user.dict())
    self._save_data(data)
    return user

def find_by_email(self, email: str) -> Optional[User]:
    """Find user by email"""
    data = self._load_data()
    for item in data:
        if item.get("email") == email:
            return User(**item)
    return None
```

#### 4. **Storage Layer Data** (`monk/users/users.json`)
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "demo_user",
    "email": "demo@ottawa.ca",
    "role": "user",
    "created_at": "2024-01-15T10:30:00Z",
    "is_active": true,
    "last_login": null
  }
]
```

## 🧩 Layer Responsibilities Details

### 1. API Layer (FastAPI Routes)
- **Primary Responsibility**: HTTP request handling, data validation, response formatting
- **File Location**: `backend/app/api/*.py`
- **Core Features**:
  - RESTful API endpoint design
  - Pydantic request/response model validation
  - Standardized HTTP status code management
  - Unified error handling mechanism
  - Auto-generated API documentation (Swagger/OpenAPI)

### 2. Service Layer (Business Logic)
- **Primary Responsibility**: Business logic implementation, data transformation, process orchestration
- **File Location**: `backend/app/services/*.py`
- **Core Features**:
  - Complex business rule implementation
  - Data validation and format conversion
  - Coordination of multiple repositories
  - Transactional operation management
  - Detailed error handling and logging

### 3. Repository Layer (Data Access)
- **Primary Responsibility**: Data access abstraction, CRUD operation encapsulation
- **File Location**: `backend/app/repositories/*.py`
- **Core Features**:
  - Unified data storage interface
  - Standardized CRUD operation methods
  - Pydantic model to dictionary conversion
  - Complex query method implementation
  - Data storage method abstraction

### 4. Storage Layer (monk/ directory)
- **Primary Responsibility**: Data persistence, file system management
- **File Location**: `backend/monk/`
- **Core Features**:
  - Human-readable JSON format storage
  - Simple and intuitive file organization structure
  - Convenient for version control and backup
  - No database service dependency required
  - Easy debugging and data migration

## 🔧 Service Implementation Examples

### User Service (UserService)
```python
class UserService:
    def __init__(self):
        self.user_repo = UserRepository()
    
    async def create_user(self, username: str, email: str, role: str = "user"):
        """User creation business logic"""
        # Validate email uniqueness
        if await self.user_repo.find_by_email(email):
            raise ValueError("Email already in use")
        
        # Validate username format
        if not self._validate_username(username):
            raise ValueError("Invalid username format")
        
        # Create user object
        user = User(
            id=str(uuid4()),
            username=username,
            email=email,
            role=role,
            created_at=datetime.now()
        )
        
        return self.user_repo.create(user)
```

### Document Service (DocumentService)  
```python
class DocumentService:
    def __init__(self):
        self.document_repo = DocumentRepository()
        
    async def process_document(self, file_path: str, user_id: str):
        """Document processing business logic"""
        # Extract document content
        content = await self._extract_text(file_path)
        
        # Generate document summary
        summary = await self._generate_summary(content)
        
        # Create document record
        document = Document(
            id=str(uuid4()),
            filename=Path(file_path).name,
            content=content,
            summary=summary,
            user_id=user_id,
            uploaded_at=datetime.now()
        )
        
        return self.document_repo.create(document)
```

### Report Service (ReportService)
```python
class ReportService:
    def __init__(self):
        self.report_repo = ReportRepository()
        self.document_repo = DocumentRepository()
        
    async def generate_research_report(self, query: str, user_id: str):
        """Generate research report"""
        # Search relevant documents
        relevant_docs = await self.document_repo.search_by_content(query)
        
        # AI generate report content
        content = await self._generate_report_content(query, relevant_docs)
        
        # Create report record
        report = Report(
            id=str(uuid4()),
            title=f"Research Report: {query}",
            content=content,
            query=query,
            user_id=user_id,
            created_at=datetime.now()
        )
        
        return self.report_repo.create(report)
```

## 🎯 Architecture Advantages

### 1. Separation of Concerns
- **API Layer**: Focuses on HTTP protocol handling
- **Service Layer**: Focuses on business logic implementation  
- **Repository Layer**: Focuses on data access abstraction
- **Storage Layer**: Focuses on data persistence

### 2. High Testability
- Each layer can be independently unit tested
- Easy to mock the repository layer for testing
- Business logic completely decoupled from data storage
- Supports integration testing and end-to-end testing

### 3. Excellent Maintainability
- Clear and well-defined code organization structure
- Easy-to-understand data flow direction
- Modular design facilitates feature extension
- High code reusability with minimal duplication

### 4. Good Scalability
- Seamless switching of storage backends (JSON → Database)
- Easy to add caching layer for performance improvement
- Simple to add new service modules
- Supports microservice architecture migration

### 5. Strong Type Safety
- Pydantic models provide runtime data validation
- Python type hints enhance code readability
- Reduces runtime issues caused by type errors
- Better IDE support for code completion and error detection

## 🚀 Running the Demo

To see the complete architecture demonstration, run:

```bash
cd backend
python demo_architecture.py
```

This demo will showcase the complete data flow:
- **User Service** → User Repository → `monk/users/users.json`
- **Report Service** → Report Repository → `monk/reports/reports.json`  
- **Document Service** → Document Repository → `monk/documents/documents.json`
- **Chat Service** → Chat Repository → `monk/chats/chats.json`

## 🔄 Database Migration Path

When the project grows and requires a database, the migration process is very simple:

### Step 1: Keep Upper Layers Unchanged
- **API Layer Code** - No modifications needed
- **Service Layer Code** - Business logic remains unchanged
- **Model Definitions** - Continue using Pydantic models

### Step 2: Update Repository Layer
```python
# From JSON file operations
class UserRepository:
    def create(self, user: User):
        data = self._load_json()
        data.append(user.dict())
        self._save_json(data)

# Migrate to database operations
class UserRepository:
    def create(self, user: User):
        with SessionLocal() as db:
            db_user = UserModel(**user.dict())
            db.add(db_user)
            db.commit()
```

### Step 3: Configuration Updates
- Add database connection configuration
- Update environment variable settings
- Add database migration scripts

### Step 4: Data Migration
- Write migration scripts to import JSON data into database
- Verify data integrity
- Switch production environment configuration

This architectural design ensures a smooth upgrade path from simple file storage to enterprise-grade databases.

## 📝 Summary

This architecture adopts the classic layered design pattern, maintaining simplicity while ensuring system professionalism and scalability. By decomposing complexity into different layers, each developer can focus on specific domain development, while the entire team can efficiently collaborate to complete complex AI research assistant systems.

## 🔗 Key Benefits

- **Rapid Prototyping**: Start with JSON files, no database setup required
- **Easy Testing**: Each layer can be tested independently
- **Clear Structure**: Well-defined responsibilities for each component
- **Future-Proof**: Smooth migration path to more complex architectures
- **Developer Friendly**: Clear separation makes onboarding easier
- **Production Ready**: Professional patterns suitable for enterprise use 
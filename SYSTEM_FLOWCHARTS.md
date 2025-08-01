# 🔄 Real Racing Santander System Flowcharts

## 📊 System Overview Flowchart

```mermaid
graph TB
    subgraph "🌐 User Interface"
        A[User Browser] --> B[React Frontend]
        B --> C[Home Page]
        B --> D[Squad Page]
        B --> E[History Page]
        B --> F[Admin Page]
    end

    subgraph "🔧 Backend API"
        G[FastAPI Server] --> H[Controllers]
        H --> I[Football Controller]
        H --> J[Scraper Controller]
        H --> K[Health Controller]
    end

    subgraph "💾 Data Layer"
        L[Supabase Database] --> M[Players Table]
        L --> N[Fixtures Table]
        L --> O[Standings Table]
        L --> P[Cache Table]
    end

    subgraph "🌍 External Sources"
        Q[FBref.com] --> R[Web Scraping]
        R --> S[BeautifulSoup Parser]
    end

    B <--> G
    G <--> L
    G <--> Q

    style A fill:#e3f2fd
    style L fill:#f3e5f5
    style Q fill:#fff3e0
```

## ⚡ Instant Data Loading Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database
    participant S as Scraper
    participant E as External

    U->>F: Request Squad Data
    F->>F: Check Client Cache
    alt Cache Valid
        F-->>U: Return Cached Data
    else Cache Invalid
        F->>B: GET /api/v1/football/players
        B->>D: Query players table
        D-->>B: Return database data
        B-->>F: Instant response (~100ms)
        F-->>U: Display data immediately

        Note over B,S: Background Update Process
        B->>B: Check cache expiration
        alt Cache Expired
            B->>S: Trigger async update
            S->>E: Scrape FBref.com
            E-->>S: Return HTML data
            S->>S: Parse player data
            S->>D: Update players table
            S->>D: Update cache status
        end
    end
```

## 🔄 Cache Management Flow

```mermaid
graph TD
    A[Data Request] --> B{Client Cache Valid?}
    B -->|Yes| C[Return Client Cache]
    B -->|No| D[API Request]

    D --> E{Server Cache Valid?}
    E -->|Yes| F[Return Database Data]
    E -->|No| G[Trigger Background Update]

    G --> H[Scrape External Source]
    H --> I[Parse Data]
    I --> J[Validate Data]
    J --> K{Data Valid?}
    K -->|Yes| L[Update Database]
    K -->|No| M[Log Error]

    L --> N[Update Cache Status]
    N --> O[Return Success]
    M --> P[Use Fallback Data]

    F --> Q[Update Client Cache]
    C --> R[Display Data]
    O --> R
    P --> R

    style A fill:#e3f2fd
    style R fill:#e8f5e8
    style H fill:#fff3e0
    style M fill:#ffebee
```

## 🛡️ Fallback System Flow

```mermaid
graph TD
    A[Data Request] --> B[Primary: Database]
    B --> C{Database Available?}
    C -->|Yes| D{Data Fresh?}
    C -->|No| E[Secondary: Legacy Scraper]

    D -->|Yes| F[Return Database Data]
    D -->|No| G[Trigger Background Update]
    G --> H[Return Stale Data + Update]

    E --> I{Scraper Available?}
    I -->|Yes| J[Scrape FBref.com]
    I -->|No| K[Tertiary: Static Data]

    J --> L{Scraping Successful?}
    L -->|Yes| M[Return Scraped Data]
    L -->|No| K

    K --> N[Return Static Fallback]

    F --> O[Success Response]
    H --> O
    M --> O
    N --> O

    style A fill:#e3f2fd
    style O fill:#e8f5e8
    style K fill:#fff3e0
    style L fill:#ffebee
```

## 📊 Database Operations Flow

```mermaid
graph LR
    subgraph "📥 Data Input"
        A[Scraper Service] --> B[Data Validation]
        B --> C[Pydantic Models]
    end

    subgraph "💾 Database Layer"
        D[Supabase Client] --> E[Players Table]
        D --> F[Fixtures Table]
        D --> G[Standings Table]
        D --> H[Cache Table]
    end

    subgraph "📤 Data Output"
        I[API Controllers] --> J[Data Serialization]
        J --> K[JSON Response]
    end

    C --> D
    E --> I
    F --> I
    G --> I
    H --> I

    style A fill:#fff3e0
    style D fill:#f3e5f5
    style K fill:#e8f5e8
```

## 🔧 Error Handling Flow

```mermaid
graph TD
    A[Operation Starts] --> B{Database Error?}
    B -->|Yes| C[Log Database Error]
    B -->|No| D{Scraper Error?}

    C --> E[Use Legacy Scraper]
    D -->|Yes| F[Log Scraper Error]
    D -->|No| G{Network Error?}

    E --> H{Legacy Success?}
    H -->|Yes| I[Return Legacy Data]
    H -->|No| J[Use Static Fallback]

    F --> K[Use Static Fallback]
    G -->|Yes| L[Log Network Error]
    G -->|No| M{Validation Error?}

    L --> N[Use Cached Data]
    M -->|Yes| O[Log Validation Error]
    M -->|No| P[Return Error Response]

    O --> Q[Return Error Response]

    I --> R[Success Response]
    J --> R
    K --> R
    N --> R

    style A fill:#e3f2fd
    style R fill:#e8f5e8
    style P fill:#ffebee
    style Q fill:#ffebee
```

## 🚀 Performance Optimization Flow

```mermaid
graph TD
    A[User Request] --> B[Client Cache Check]
    B --> C{Cache Hit?}
    C -->|Yes| D[Return in ~1ms]
    C -->|No| E[Server Request]

    E --> F[Database Query]
    F --> G{Index Hit?}
    G -->|Yes| H[Return in ~50ms]
    G -->|No| I[Full Table Scan]

    I --> J[Return in ~200ms]
    H --> K[Update Client Cache]
    J --> K
    K --> L[Response to User]
    D --> L

    style A fill:#e3f2fd
    style D fill:#e8f5e8
    style H fill:#e8f5e8
    style I fill:#fff3e0
```

## 📈 Data Update Cycle

```mermaid
graph TD
    A[Cache Expiration Check] --> B{Players Cache Expired?}
    B -->|Yes| C[Trigger Players Update]
    B -->|No| D{Fixtures Cache Expired?}

    C --> E[Scrape Players Data]
    D -->|Yes| F[Trigger Fixtures Update]
    D -->|No| G{Standings Cache Expired?}

    E --> H[Update Players Table]
    F --> I[Scrape Fixtures Data]
    G -->|Yes| J[Trigger Standings Update]
    G -->|No| K[All Caches Valid]

    H --> L[Update Cache Status]
    I --> M[Update Fixtures Table]
    J --> N[Scrape Standings Data]

    L --> O[Background Complete]
    M --> P[Update Cache Status]
    N --> Q[Update Standings Table]

    P --> O
    Q --> R[Update Cache Status]
    R --> O
    K --> S[No Action Needed]

    style A fill:#e3f2fd
    style O fill:#e8f5e8
    style S fill:#e8f5e8
    style E fill:#fff3e0
    style I fill:#fff3e0
    style N fill:#fff3e0
```

## 🔍 Monitoring & Health Check Flow

```mermaid
graph TD
    A[Health Check Request] --> B[Database Connectivity]
    B --> C{DB Connected?}
    C -->|Yes| D[Check Cache Status]
    C -->|No| E[Log DB Error]

    D --> F[Check Scraper Health]
    F --> G{Scraper Working?}
    G -->|Yes| H[Check API Performance]
    G -->|No| I[Log Scraper Error]

    H --> J[Calculate Response Times]
    J --> K[Check Error Rates]
    K --> L[Generate Health Report]

    E --> M[Return Error Status]
    I --> M
    L --> N[Return Health Status]

    style A fill:#e3f2fd
    style N fill:#e8f5e8
    style M fill:#ffebee
```

## 🎯 User Journey Flow

```mermaid
graph TD
    A[User Visits Site] --> B[Load Home Page]
    B --> C[Display Overview Data]
    C --> D{User Clicks Squad?}

    D -->|Yes| E[Load Squad Page]
    D -->|No| F{User Clicks History?}

    E --> G[Fetch Players Data]
    F -->|Yes| H[Load History Page]
    F -->|No| I{User Clicks Admin?}

    G --> J[Display Players]
    H --> K[Fetch Fixtures Data]
    I -->|Yes| L[Load Admin Page]
    I -->|No| M[User Browsing]

    K --> N[Display Fixtures]
    L --> O[Show Data Management]

    J --> P[User Interaction]
    N --> P
    O --> P
    M --> P

    P --> Q{Force Refresh?}
    Q -->|Yes| R[Trigger Data Update]
    Q -->|No| S[Continue Browsing]

    R --> T[Show Update Status]
    S --> U[Monitor Cache Status]

    style A fill:#e3f2fd
    style P fill:#e8f5e8
    style T fill:#fff3e0
```

## 🔧 Configuration Management Flow

```mermaid
graph TD
    A[Application Start] --> B[Load Environment Variables]
    B --> C[Initialize Supabase Client]
    C --> D[Setup Cache Durations]
    D --> E[Configure Logging]
    E --> F[Setup Middleware]
    F --> G[Start API Server]

    G --> H[Register Routes]
    H --> I[Setup Error Handling]
    I --> J[Initialize Services]
    J --> K[Ready for Requests]

    style A fill:#e3f2fd
    style K fill:#e8f5e8
```

---

_These flowcharts provide a comprehensive visual representation of the system's architecture, data flows, and operational processes._

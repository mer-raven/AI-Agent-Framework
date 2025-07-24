# AI Agent Framework - System Architecture

## 🏗️ Overall Architecture

The AI Agent Framework follows a proven 4-Agent architecture pattern that provides a clean separation of concerns and enables scalable, maintainable AI agent development.

```mermaid
graph TB
    subgraph "User Interface Layer"
        U[👤 User Input]
        S[💬 Slack]
        W[🌐 Web Interface]
        WH[🔗 Webhooks]
    end
    
    subgraph "AI Agent Framework Core"
        subgraph "Main Orchestrator"
            O[🎯 FrameworkOrchestrator]
        end
        
        subgraph "4-Agent Architecture"
            A1[🧠 InputParserAgent<br/>Intent Classification]
            A2[🔍 ContentRetrieverAgent<br/>Data Search & Filtering]
            A3[📝 ResponseGeneratorAgent<br/>Response Generation]
            A4[📊 LoggerAgent<br/>Logging & Analytics]
        end
        
        subgraph "Configuration System"
            C[⚙️ BaseConfig<br/>Agent Settings]
            I[📋 Intent Definitions]
            T[📄 Response Templates]
        end
        
        subgraph "Data Layer"
            DP[🔌 DataProvider Interface]
            DS1[📊 Google Sheets]
            DS2[🌐 REST API]
            DS3[📋 JSON Data]
            DS4[🧪 Mock Data]
        end
    end
    
    subgraph "External Services"
        OAI[🤖 OpenAI API<br/>GPT-3.5-turbo]
        GS[📊 Google Sheets<br/>Data & Logs]
        SA[💬 Slack API<br/>Messages & Threads]
    end
    
    %% User Flow
    U --> O
    S --> O
    W --> O
    WH --> O
    
    %% Agent Flow
    O --> A1
    A1 --> A2
    A2 --> A3
    A3 --> A4
    
    %% Configuration Flow
    C --> A1
    C --> A2
    C --> A3
    I --> A1
    T --> A3
    
    %% Data Flow
    A2 --> DP
    DP --> DS1
    DP --> DS2
    DP --> DS3
    DP --> DS4
    
    %% External Service Integration
    A1 --> OAI
    A3 --> OAI
    A4 --> GS
    DS1 --> GS
    O --> SA
    
    %% Response Flow
    A3 --> S
    A3 --> W
    A3 --> WH
    
    %% Styling
    classDef userLayer fill:#E3F2FD
    classDef coreLayer fill:#F3E5F5
    classDef agentLayer fill:#E8F5E8
    classDef configLayer fill:#FFF3E0
    classDef dataLayer fill:#FAFAFA
    classDef externalLayer fill:#FFEBEE
    
    class U,S,W,WH userLayer
    class O coreLayer
    class A1,A2,A3,A4 agentLayer
    class C,I,T configLayer
    class DP,DS1,DS2,DS3,DS4 dataLayer
    class OAI,GS,SA externalLayer
```

## 🔄 Processing Flow

```mermaid
sequenceDiagram
    participant User
    participant Orchestrator
    participant InputParser
    participant ContentRetriever
    participant ResponseGenerator
    participant Logger
    participant Slack
    participant OpenAI
    participant DataSource

    User->>Orchestrator: User Input
    
    Note over Orchestrator: Validate inputs & load config
    
    Orchestrator->>InputParser: Parse intent & parameters
    InputParser->>OpenAI: Classify intent using AI
    OpenAI-->>InputParser: Intent + Parameters
    InputParser-->>Orchestrator: Parsed result
    
    Orchestrator->>ContentRetriever: Search with intent & params
    ContentRetriever->>DataSource: Load data
    DataSource-->>ContentRetriever: Raw data
    Note over ContentRetriever: Filter, sort, process
    ContentRetriever-->>Orchestrator: Search results
    
    Orchestrator->>ResponseGenerator: Generate response
    alt AI Response Enabled
        ResponseGenerator->>OpenAI: Generate natural response
        OpenAI-->>ResponseGenerator: AI-generated text
    else Template Response
        Note over ResponseGenerator: Use configured templates
    end
    ResponseGenerator-->>Orchestrator: Formatted response
    
    par Integrations
        Orchestrator->>Slack: Send message (if enabled)
        Slack-->>Orchestrator: Message sent
    and
        Orchestrator->>Logger: Log interaction
        Logger->>DataSource: Write log data
    end
    
    Orchestrator-->>User: Final response
```

## 🧩 Component Architecture

```mermaid
graph LR
    subgraph "Framework Core"
        subgraph "Agents"
            IP[InputParserAgent]
            CR[ContentRetrieverAgent] 
            RG[ResponseGeneratorAgent]
            LG[LoggerAgent]
        end
        
        subgraph "Orchestration"
            FO[FrameworkOrchestrator]
            EH[Error Handling]
            VL[Validation Layer]
        end
        
        subgraph "Configuration"
            BC[BaseConfig]
            AC[Agent Config]
            IC[Intent Config]
            RT[Response Templates]
        end
        
        subgraph "Data Layer"
            DPI[DataProvider Interface]
            GDP[Google Sheets Provider]
            ADP[API Provider]
            JDP[JSON Provider]
            MDP[Mock Provider]
        end
        
        subgraph "Utilities"
            UT[Utils & Helpers]
            VS[Validation System]
            LG_SYS[Logging System]
        end
    end
    
    %% Dependencies
    FO --> IP
    FO --> CR
    FO --> RG
    FO --> LG
    FO --> EH
    FO --> VL
    
    IP --> AC
    IP --> IC
    CR --> AC
    CR --> DPI
    RG --> AC
    RG --> RT
    LG --> AC
    
    DPI --> GDP
    DPI --> ADP
    DPI --> JDP
    DPI --> MDP
    
    AC --> BC
    
    %% Styling
    classDef agents fill:#E8F5E8
    classDef orchestration fill:#E3F2FD
    classDef config fill:#FFF3E0
    classDef data fill:#FAFAFA
    classDef utils fill:#F3E5F5
    
    class IP,CR,RG,LG agents
    class FO,EH,VL orchestration
    class BC,AC,IC,RT config
    class DPI,GDP,ADP,JDP,MDP data
    class UT,VS,LG_SYS utils
```

## 🔧 Configuration Architecture

```mermaid
graph TD
    subgraph "Configuration Hierarchy"
        BF[Base Framework Config]
        
        subgraph "Agent-Specific Configs"
            LA[Learning Assistant Config]
            IT[IT Support Config]
            HR[HR Policy Config]
            CU[Custom Agent Config]
        end
        
        subgraph "Runtime Configuration"
            PS[PropertiesService<br/>API Keys & Credentials]
            SC[Session Config<br/>User & Channel Info]
            RC[Request Config<br/>Processing Options]
        end
        
        subgraph "External Configuration"
            ID[Intent Definitions<br/>Domain-specific intents]
            RT[Response Templates<br/>Multi-language templates]
            DP[Data Provider Config<br/>Source-specific settings]
        end
    end
    
    %% Configuration Inheritance
    BF --> LA
    BF --> IT
    BF --> HR
    BF --> CU
    
    %% Runtime Application
    LA --> PS
    LA --> SC
    LA --> RC
    
    IT --> PS
    HR --> PS
    CU --> PS
    
    %% External Config Usage
    LA --> ID
    LA --> RT
    LA --> DP
    
    %% Styling
    classDef base fill:#E3F2FD
    classDef specific fill:#E8F5E8
    classDef runtime fill:#FFF3E0
    classDef external fill:#FFEBEE
    
    class BF base
    class LA,IT,HR,CU specific
    class PS,SC,RC runtime
    class ID,RT,DP external
```

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Google Apps Script Environment"
        subgraph "Framework Instance"
            FA[Framework Application<br/>Google Apps Script Project]
            
            subgraph "Configuration"
                PS[PropertiesService<br/>Encrypted API Keys]
                TC[Time-based Triggers<br/>Polling & Maintenance]
            end
            
            subgraph "Storage"
                GS[Google Sheets<br/>Data & Logs]
                GD[Google Drive<br/>File Storage]
            end
        end
    end
    
    subgraph "External Services"
        subgraph "Communication"
            SA[Slack API<br/>Messages & Events]
            WH[Webhooks<br/>External Integrations]
        end
        
        subgraph "AI Services"
            OAI[OpenAI API<br/>GPT Models]
        end
        
        subgraph "Data Sources"
            API[External APIs<br/>REST Services]
            DB[External Databases<br/>Optional]
        end
    end
    
    subgraph "User Interfaces"
        SC[Slack Channels<br/>Interactive Chat]
        WI[Web Interface<br/>Optional Dashboard]
        MB[Mobile Apps<br/>Slack Mobile]
    end
    
    %% Connections
    FA --> PS
    FA --> TC
    FA --> GS
    FA --> GD
    
    FA <--> SA
    FA --> WH
    FA <--> OAI
    FA <--> API
    FA --> DB
    
    SA <--> SC
    SA <--> MB
    WI --> FA
    
    %% Styling
    classDef gas fill:#E8F5E8
    classDef storage fill:#E3F2FD
    classDef external fill:#FFEBEE
    classDef ui fill:#FFF3E0
    
    class FA,PS,TC gas
    class GS,GD storage
    class SA,WH,OAI,API,DB external
    class SC,WI,MB ui
```

## 🎯 Use Case Scenarios

```mermaid
graph LR
    subgraph "Common Use Cases"
        subgraph "Learning & Training"
            LC[Learning Content Search]
            TS[Training Scheduling]
            PS[Progress Tracking]
        end
        
        subgraph "IT Support"
            TR[Troubleshooting]
            KBS[Knowledge Base Search]
            TR_TK[Ticket Creation]
        end
        
        subgraph "HR Services"
            PP[Policy Lookup]
            LR[Leave Requests]
            EQ[Employee Questions]
        end
        
        subgraph "Business Operations"
            FS[FAQ Search]
            CS[Customer Support]
            RP[Report Generation]
        end
    end
    
    subgraph "Framework Adaptation"
        AF[AI Agent Framework]
        
        subgraph "Customization Points"
            ID[Intent Definitions]
            DP[Data Providers]
            RT[Response Templates]
            CF[Custom Functions]
        end
    end
    
    %% Use Case to Framework Mapping
    LC --> AF
    TS --> AF
    PS --> AF
    TR --> AF
    KBS --> AF
    TR_TK --> AF
    PP --> AF
    LR --> AF
    EQ --> AF
    FS --> AF
    CS --> AF
    RP --> AF
    
    %% Framework Customization
    AF --> ID
    AF --> DP
    AF --> RT
    AF --> CF
    
    %% Styling
    classDef learning fill:#E8F5E8
    classDef it fill:#E3F2FD
    classDef hr fill:#FFF3E0
    classDef business fill:#FFEBEE
    classDef framework fill:#F3E5F5
    classDef custom fill:#FAFAFA
    
    class LC,TS,PS learning
    class TR,KBS,TR_TK it
    class PP,LR,EQ hr
    class FS,CS,RP business
    class AF framework
    class ID,DP,RT,CF custom
```

## 🔄 Data Flow Patterns

```mermaid
graph TD
    subgraph "Input Processing"
        UI[User Input]
        NLP[Natural Language Processing]
        IC[Intent Classification]
        PE[Parameter Extraction]
    end
    
    subgraph "Data Processing"
        DL[Data Loading]
        DF[Data Filtering]
        DS[Data Sorting]
        DA[Data Aggregation]
    end
    
    subgraph "Response Processing"
        RG[Response Generation]
        TF[Template Formatting]
        LF[Language Formatting]
        PF[Platform Formatting]
    end
    
    subgraph "Output Processing"
        IO[Integration Output]
        LO[Logging Output]
        NO[Notification Output]
        FO[Feedback Output]
    end
    
    %% Flow
    UI --> NLP
    NLP --> IC
    IC --> PE
    
    PE --> DL
    DL --> DF
    DF --> DS
    DS --> DA
    
    DA --> RG
    RG --> TF
    TF --> LF
    LF --> PF
    
    PF --> IO
    PF --> LO
    IO --> NO
    NO --> FO
    
    %% Styling
    classDef input fill:#E8F5E8
    classDef data fill:#E3F2FD
    classDef response fill:#FFF3E0
    classDef output fill:#FFEBEE
    
    class UI,NLP,IC,PE input
    class DL,DF,DS,DA data
    class RG,TF,LF,PF response
    class IO,LO,NO,FO output
``` 
# AI Agent Framework - Data Flow Diagrams

## 📊 Complete Data Flow Architecture

This document visualizes how data flows through the AI Agent Framework from user input to final response, including all processing stages and data transformations.

## 🔄 Main Processing Pipeline

```mermaid
flowchart TB
    subgraph "Input Stage"
        UI[👤 User Input<br/>"Find QA training"]
        UVF[User Input Validation]
        UCI[User Context Integration]
    end
    
    subgraph "Parsing Stage"
        subgraph "InputParserAgent"
            ISP[Input Sanitization<br/>& Preprocessing]
            OAI1[OpenAI API Call<br/>Intent Classification]
            IPP[Intent & Parameter<br/>Processing]
            LNG[Language Detection<br/>& Configuration]
        end
    end
    
    subgraph "Data Retrieval Stage"
        subgraph "ContentRetrieverAgent"
            DPC[Data Provider<br/>Configuration]
            DLD[Data Loading<br/>from Sources]
            DFT[Data Filtering<br/>by Category/Role]
            DKF[Keyword Filtering<br/>& Processing]
            DSR[Data Sorting<br/>& Ranking]
        end
        
        subgraph "Data Sources"
            DS1[📊 Google Sheets<br/>Structured Data]
            DS2[🌐 REST APIs<br/>External Data]
            DS3[📋 JSON Files<br/>Static Data]
            DS4[🧪 Mock Data<br/>Testing Data]
        end
    end
    
    subgraph "Response Generation Stage"
        subgraph "ResponseGeneratorAgent"
            RTC[Response Type<br/>Classification]
            TMR[Template-based<br/>Response]
            AIR[AI-powered<br/>Response]
            RFT[Response Formatting<br/>& Platform Adaptation]
        end
    end
    
    subgraph "Output Stage"
        subgraph "Integration Layer"
            SLK[💬 Slack Integration<br/>Threading & Mentions]
            WEB[🌐 Webhook Integration<br/>External Systems]
            LOG[📊 Logging Integration<br/>Analytics & Monitoring]
        end
        
        UR[👤 User Response<br/>Formatted Output]
    end
    
    %% Main Flow
    UI --> UVF
    UVF --> UCI
    UCI --> ISP
    
    ISP --> OAI1
    OAI1 --> IPP
    IPP --> LNG
    
    LNG --> DPC
    DPC --> DLD
    DLD --> DFT
    DFT --> DKF
    DKF --> DSR
    
    %% Data Sources
    DLD --> DS1
    DLD --> DS2
    DLD --> DS3
    DLD --> DS4
    
    DSR --> RTC
    RTC --> TMR
    RTC --> AIR
    TMR --> RFT
    AIR --> RFT
    
    RFT --> SLK
    RFT --> WEB
    RFT --> LOG
    
    SLK --> UR
    
    %% Styling
    classDef inputStage fill:#E8F5E8
    classDef parseStage fill:#E3F2FD
    classDef dataStage fill:#FFF3E0
    classDef responseStage fill:#FFEBEE
    classDef outputStage fill:#F3E5F5
    classDef dataSource fill:#FAFAFA
    
    class UI,UVF,UCI inputStage
    class ISP,OAI1,IPP,LNG parseStage
    class DPC,DLD,DFT,DKF,DSR dataStage
    class RTC,TMR,AIR,RFT responseStage
    class SLK,WEB,LOG,UR outputStage
    class DS1,DS2,DS3,DS4 dataSource
```

## 🧠 Intent Processing Flow

```mermaid
flowchart LR
    subgraph "Input Analysis"
        RAW[Raw User Input<br/>"Show me Go programming courses"]
        CLN[Cleaned Input<br/>"Go programming courses"]
        CTX[Context Integration<br/>Thread + User Info]
    end
    
    subgraph "OpenAI Processing"
        SYS[System Prompt<br/>Intent Classification Rules]
        USR[User Prompt<br/>Enhanced Input]
        MDL[GPT-3.5-turbo<br/>AI Processing]
        RSP[AI Response<br/>JSON Structure]
    end
    
    subgraph "Result Processing"
        JSON[JSON Parsing<br/>Intent Extraction]
        VAL[Validation<br/>Against Intent Definitions]
        ENH[Result Enhancement<br/>Confidence + Language]
    end
    
    subgraph "Output Structure"
        INT[Intent: "search_by_category"]
        PAR[Parameters:<br/>{category: "programming",<br/>keywords: ["Go"],<br/>language: "english"}]
        CON[Confidence: 0.9]
        LAN[Language: "english"]
    end
    
    %% Flow
    RAW --> CLN
    CLN --> CTX
    CTX --> USR
    
    SYS --> MDL
    USR --> MDL
    MDL --> RSP
    
    RSP --> JSON
    JSON --> VAL
    VAL --> ENH
    
    ENH --> INT
    ENH --> PAR
    ENH --> CON
    ENH --> LAN
    
    %% Styling
    classDef input fill:#E8F5E8
    classDef openai fill:#E3F2FD
    classDef processing fill:#FFF3E0
    classDef output fill:#FFEBEE
    
    class RAW,CLN,CTX input
    class SYS,USR,MDL,RSP openai
    class JSON,VAL,ENH processing
    class INT,PAR,CON,LAN output
```

## 🔍 Content Retrieval Flow

```mermaid
flowchart TD
    subgraph "Data Source Selection"
        CFG[Agent Configuration<br/>Data Provider Type]
        DP[Data Provider Instance<br/>Google Sheets/API/JSON]
        CRD[Credentials Loading<br/>API Keys & Sheet IDs]
    end
    
    subgraph "Data Loading"
        subgraph "Google Sheets Provider"
            SHT[Open Google Sheet<br/>by Sheet ID]
            RNG[Get Data Range<br/>All Rows]
            HDR[Extract Headers<br/>Column Names]
            DAT[Parse Data Rows<br/>Object Array]
        end
        
        subgraph "API Provider"
            URL[API Endpoint URL<br/>Configuration]
            AUTH[Authentication<br/>Bearer/API Key]
            REQ[HTTP Request<br/>GET/POST]
            APD[API Response<br/>JSON Parsing]
        end
    end
    
    subgraph "Data Processing"
        RAW[Raw Data Array<br/>All Content Items]
        
        subgraph "Filtering Pipeline"
            CAT[Category Filter<br/>Match + Aliases]
            ROL[Role Filter<br/>Target Audience]
            KEY[Keyword Filter<br/>Title/Description/Tags]
            LVL[Level Filter<br/>Beginner/Intermediate/Advanced]
            TYP[Type Filter<br/>Video/Course/Training]
        end
        
        subgraph "Processing Pipeline"
            SRT[Sorting<br/>Relevance/Date/Title]
            LMT[Limit Application<br/>Max Results]
            MTD[Metadata Addition<br/>Source/Timestamp]
        end
    end
    
    subgraph "Output"
        RES[Filtered Results<br/>Array of Matching Items]
        MET[Result Metadata<br/>Count/Source/Timing]
    end
    
    %% Flow
    CFG --> DP
    DP --> CRD
    
    %% Google Sheets Path
    CRD --> SHT
    SHT --> RNG
    RNG --> HDR
    HDR --> DAT
    
    %% API Path
    CRD --> URL
    URL --> AUTH
    AUTH --> REQ
    REQ --> APD
    
    %% Data Processing
    DAT --> RAW
    APD --> RAW
    
    RAW --> CAT
    CAT --> ROL
    ROL --> KEY
    KEY --> LVL
    LVL --> TYP
    
    TYP --> SRT
    SRT --> LMT
    LMT --> MTD
    
    MTD --> RES
    MTD --> MET
    
    %% Styling
    classDef config fill:#E8F5E8
    classDef loading fill:#E3F2FD
    classDef processing fill:#FFF3E0
    classDef output fill:#FFEBEE
    
    class CFG,DP,CRD config
    class SHT,RNG,HDR,DAT,URL,AUTH,REQ,APD loading
    class RAW,CAT,ROL,KEY,LVL,TYP,SRT,LMT,MTD processing
    class RES,MET output
```

## 📝 Response Generation Flow

```mermaid
flowchart LR
    subgraph "Input Processing"
        INT[Intent<br/>"search_by_category"]
        PAR[Parameters<br/>{category: "QA"}]
        RES[Search Results<br/>3 QA Courses]
        CFG[Agent Configuration<br/>Templates & Settings]
    end
    
    subgraph "Response Type Decision"
        TYP[Response Type<br/>Determination]
        
        subgraph "Type Options"
            RF[Results Found<br/>Show Content]
            NR[No Results<br/>Suggestions]
            HLP[Help Request<br/>Instructions]
            ERR[Error Occurred<br/>Fallback]
        end
    end
    
    subgraph "Response Generation"
        subgraph "Template-based"
            TMP[Template Selection<br/>Language + Type]
            FMT[Format Application<br/>Header + Items + Footer]
            VAR[Variable Replacement<br/>{title}, {description}]
        end
        
        subgraph "AI-powered"
            SYS2[System Prompt<br/>Response Guidelines]
            CTX[Context Preparation<br/>Results + Intent]
            OAI2[OpenAI API Call<br/>Response Generation]
            AIR[AI Response<br/>Natural Language]
        end
    end
    
    subgraph "Post-processing"
        LNG[Language Formatting<br/>English/Japanese]
        PLT[Platform Formatting<br/>Slack/Web/API]
        CLN[Cleanup & Validation<br/>Final Checks]
    end
    
    subgraph "Output"
        FIN[Final Response<br/>Ready for Delivery]
        META[Response Metadata<br/>Type/Length/Language]
    end
    
    %% Flow
    INT --> TYP
    PAR --> TYP
    RES --> TYP
    CFG --> TYP
    
    TYP --> RF
    TYP --> NR
    TYP --> HLP
    TYP --> ERR
    
    %% Template Path
    RF --> TMP
    NR --> TMP
    HLP --> TMP
    TMP --> FMT
    FMT --> VAR
    
    %% AI Path
    RF --> SYS2
    SYS2 --> CTX
    CTX --> OAI2
    OAI2 --> AIR
    
    %% Post-processing
    VAR --> LNG
    AIR --> LNG
    LNG --> PLT
    PLT --> CLN
    
    CLN --> FIN
    CLN --> META
    
    %% Styling
    classDef input fill:#E8F5E8
    classDef decision fill:#E3F2FD
    classDef generation fill:#FFF3E0
    classDef postproc fill:#FFEBEE
    classDef output fill:#F3E5F5
    
    class INT,PAR,RES,CFG input
    class TYP,RF,NR,HLP,ERR decision
    class TMP,FMT,VAR,SYS2,CTX,OAI2,AIR generation
    class LNG,PLT,CLN postproc
    class FIN,META output
```

## 🔄 Slack Integration Flow

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Slack as 💬 Slack
    participant Framework as 🎯 Framework
    participant Agent as 🤖 Agent
    participant OpenAI as 🧠 OpenAI
    participant Sheets as 📊 Sheets
    
    Note over User,Sheets: User Interaction Flow
    
    User->>Slack: @Bot "Find QA training"
    Slack->>Framework: Message Event
    
    Note over Framework: Message Processing
    Framework->>Framework: Extract user input
    Framework->>Framework: Clean mentions
    Framework->>Framework: Get user context
    
    Note over Framework,Agent: Agent Processing
    Framework->>Agent: Process request
    Agent->>OpenAI: Parse intent
    OpenAI-->>Agent: Intent + parameters
    Agent->>Sheets: Load content data
    Sheets-->>Agent: Training content
    Agent->>Agent: Filter & process
    Agent->>OpenAI: Generate response
    OpenAI-->>Agent: Formatted response
    Agent-->>Framework: Final response
    
    Note over Framework,Slack: Response Delivery
    Framework->>Framework: Add user mention
    Framework->>Framework: Format for Slack
    Framework->>Slack: Post message
    Slack-->>Framework: Message posted (ts)
    Framework->>Sheets: Log interaction
    Slack->>User: Show response
    
    Note over User,Sheets: Thread Follow-up
    User->>Slack: "Tell me more" (in thread)
    Slack->>Framework: Thread reply event
    Framework->>Framework: Get thread context
    Framework->>Agent: Process with context
    Agent->>Agent: Enhanced processing
    Agent-->>Framework: Contextual response
    Framework->>Slack: Reply in thread
    Slack->>User: Show thread response
```

## 📊 Logging & Analytics Flow

```mermaid
flowchart TD
    subgraph "Data Collection"
        INT[User Interaction<br/>Input + Context]
        AGT[Agent Processing<br/>Intent + Results]
        RSP[Response Generation<br/>Output + Metadata]
        ERR[Error Handling<br/>Failures + Recovery]
    end
    
    subgraph "Log Data Preparation"
        SES[Session ID<br/>Unique Identifier]
        USR[User Information<br/>ID + Channel]
        TMG[Timing Data<br/>Processing Duration]
        MET[Processing Metadata<br/>Confidence + Language]
    end
    
    subgraph "Log Formatting"
        JSON[JSON Structure<br/>Standardized Format]
        VAL[Data Validation<br/>Required Fields]
        ANO[Anonymization<br/>Privacy Protection]
    end
    
    subgraph "Storage Options"
        subgraph "Google Sheets"
            SHT[Log Sheet<br/>Structured Rows]
            COL[Column Mapping<br/>Field Assignment]
            APP[Append Row<br/>New Entry]
        end
        
        subgraph "Console Logging"
            CON[Console Output<br/>Debug Information]
            FMT[Formatted Display<br/>Readable Format]
        end
        
        subgraph "External Systems"
            WH[Webhook Delivery<br/>Real-time Events]
            API[API Endpoints<br/>External Analytics]
        end
    end
    
    subgraph "Analytics Processing"
        AGG[Data Aggregation<br/>Usage Patterns]
        TRD[Trend Analysis<br/>Performance Metrics]
        ALT[Alert Generation<br/>Error Monitoring]
    end
    
    %% Flow
    INT --> SES
    AGT --> USR
    RSP --> TMG
    ERR --> MET
    
    SES --> JSON
    USR --> JSON
    TMG --> JSON
    MET --> JSON
    
    JSON --> VAL
    VAL --> ANO
    
    ANO --> SHT
    ANO --> CON
    ANO --> WH
    
    SHT --> COL
    COL --> APP
    
    CON --> FMT
    
    WH --> API
    
    APP --> AGG
    FMT --> TRD
    API --> ALT
    
    %% Styling
    classDef collection fill:#E8F5E8
    classDef preparation fill:#E3F2FD
    classDef formatting fill:#FFF3E0
    classDef storage fill:#FFEBEE
    classDef analytics fill:#F3E5F5
    
    class INT,AGT,RSP,ERR collection
    class SES,USR,TMG,MET preparation
    class JSON,VAL,ANO formatting
    class SHT,COL,APP,CON,FMT,WH,API storage
    class AGG,TRD,ALT analytics
```

## 🔄 Error Handling Flow

```mermaid
flowchart TB
    subgraph "Error Sources"
        UIE[User Input Errors<br/>Invalid/Empty]
        CFE[Configuration Errors<br/>Missing Keys/Settings]
        AIE[OpenAI API Errors<br/>Rate Limits/Failures]
        DAE[Data Access Errors<br/>Sheets/API Failures]
        SLE[Slack API Errors<br/>Permission/Network]
    end
    
    subgraph "Error Detection"
        VAL[Input Validation<br/>Early Detection]
        TRY[Try-Catch Blocks<br/>Runtime Errors]
        MON[API Monitoring<br/>Response Codes]
        LOG[Error Logging<br/>Detailed Capture]
    end
    
    subgraph "Error Classification"
        REC[Recoverable Errors<br/>Retry Logic]
        FAT[Fatal Errors<br/>Immediate Failure]
        USR[User Errors<br/>Input Issues]
        SYS[System Errors<br/>Technical Issues]
    end
    
    subgraph "Recovery Strategies"
        subgraph "Automatic Recovery"
            RTY[Retry with Backoff<br/>API Failures]
            FBK[Fallback Methods<br/>Alternative Sources]
            DFT[Default Responses<br/>Template-based]
        end
        
        subgraph "Graceful Degradation"
            SMP[Simplified Responses<br/>Reduced Features]
            MSK[Mock Data Usage<br/>Testing Fallback]
            MAN[Manual Intervention<br/>Admin Notification]
        end
    end
    
    subgraph "User Communication"
        ERR[Error Messages<br/>User-friendly]
        SUG[Suggestions<br/>Recovery Actions]
        HLP[Help Information<br/>Alternative Options]
        ESC[Escalation Path<br/>Support Contact]
    end
    
    %% Flow
    UIE --> VAL
    CFE --> TRY
    AIE --> MON
    DAE --> MON
    SLE --> LOG
    
    VAL --> USR
    TRY --> SYS
    MON --> REC
    MON --> FAT
    LOG --> SYS
    
    REC --> RTY
    REC --> FBK
    FAT --> DFT
    USR --> SMP
    SYS --> MSK
    SYS --> MAN
    
    RTY --> ERR
    FBK --> SUG
    DFT --> HLP
    SMP --> ESC
    
    %% Styling
    classDef errors fill:#FFCDD2
    classDef detection fill:#E8F5E8
    classDef classification fill:#E3F2FD
    classDef recovery fill:#FFF3E0
    classDef communication fill:#FFEBEE
    
    class UIE,CFE,AIE,DAE,SLE errors
    class VAL,TRY,MON,LOG detection
    class REC,FAT,USR,SYS classification
    class RTY,FBK,DFT,SMP,MSK,MAN recovery
    class ERR,SUG,HLP,ESC communication
``` 
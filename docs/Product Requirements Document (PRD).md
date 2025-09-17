# Product Requirements Document (PRD)

## Project: Ottawa Economic Development Team GenAI Research Assistant

------

## 🚧 **Project Implementation Phase Overview**

### Current Status: **Phase One - High-Fidelity Prototype (September 2024)**
✅ **Completed:** Frontend prototype interface and user experience validation  
✅ **Completed:** Technical architecture analysis and user authentication needs assessment  
🔄 **In Progress:** Stakeholder feedback collection and design validation  
📋 **Next:** User authentication system implementation and AI backend integration  

### 🔐 **Authentication Requirements Analysis (September 2024)**
**Analysis Status:** ✅ **Completed**
- **User Infrastructure:** Comprehensive user management models already implemented
- **Security Framework:** JWT authentication configuration ready
- **Role-Based Access:** Multi-level permission system designed (researcher/analyst/admin)
- **Government Compliance:** Secure access control required for municipal data
- **Recommendation:** **Implement authentication system** before AI backend integration

------

## 1. Project Background

The Ottawa Economic Development (ED) team plans to collaborate with Algonquin College AI courses to develop a **Generative AI Research Assistant**. This tool will allow municipal staff (and potentially residents in the future) to ask questions in natural language, with the system extracting answers from **uploaded PDF reports** and **ottawa.ca public website information**, generating **structured analytical reports and visualization charts**.

This project is positioned as a **Proof of Concept (PoC)**, led by students under the **City Studio Program** framework.

**Implementation Strategy: Phased Development**
1. **Phase One**: Frontend prototype development ✅ **Completed**
2. **Phase Two**: AI backend integration (planned)
3. **Phase Three**: Production environment deployment (future)

------

## 2. Project Objectives

### 🎯 **Phase One Objectives (Currently Achieved)**
✅ 1. Create government-standard compliant user interface prototype  
✅ 2. Validate accessibility (AoDA/WCAG) and bilingual (English/French) compliance  
✅ 3. Demonstrate complete user experience flow  
✅ 4. Collect stakeholder feedback  

### 🔮 **Ultimate Objectives (Complete Version)**
1. Provide natural language Q&A functionality to simplify data query processes.
2. Automate generation of analytical reports and visualizations based on PDF/website data.
3. Support internal staff in efficient data research and decision-making reference.
4. Comply with municipal requirements for **accessibility (AoDA/WCAG)** and **bilingual (English/French)** standards.
5. Validate the practical feasibility of AI applications in municipal scenarios.

------

## 3. User Roles

- **Municipal Economic Development Team Members**
  - Need to quickly query and analyze economic development-related reports and data.
- **Other Municipal Department Staff (Internal PoC Phase)**
  - Validate tool versatility and expansion potential.
- **Resident Users (Future Phase)**
  - Use AI chatbot through website/portal to obtain information.

------

## 4. Use Cases

### 🎭 **Current Prototype Demo Scenarios**

#### Scenario 1: Interface Experience Testing ✅
- User: ED team member
- Action: Browse all pages, test interactive functions
- Output: Complete UI/UX experience with simulated data display

#### Scenario 2: Accessibility Feature Validation ✅
- User: Staff with special needs
- Action: Use keyboard navigation, screen readers, high contrast mode
- Output: Confirm WCAG 2.1 standard compliance

#### Scenario 3: Bilingual Functionality Testing ✅
- User: French-speaking user
- Action: Switch languages, validate all interface elements
- Output: Complete English-French bilingual support

### 🚀 **Future Complete Version Scenarios**

#### Scenario 4: Quick Summary (Planned Development)
- User: Economic Development team member
- Action: Upload quarterly "ED Update Report", input "Summarize main economic trends this quarter"
- Output: System generates text summary + line chart showing quarterly trend changes

#### Scenario 5: Metric Query (Planned Development)
- User: Internal analyst
- Action: Input "Total amount of small business loan support over the past two years"
- Output: System generates table + bar chart with text explanation

#### Scenario 6: Policy Q&A (Future Resident Portal)
- User: Citizen
- Action: Ask "What entrepreneurship support programs can I apply for?"
- Output: System returns FAQ-style answer with application portal links

------

## 5. Feature Requirements Implementation Status

### 5.1 Natural Language Q&A

**🎭 Prototype Status:** ✅ UI interface completed, simulated conversational interaction  
**🔮 Complete Version:** 
- Input box supports English/French.
- Returns text answers (Markdown format).
- Supports multi-turn conversations (context preservation).

### 5.2 Document Parsing

**🎭 Prototype Status:** ✅ Upload interface completed, simulated processing flow  
**🔮 Complete Version:**
- Upload PDF, display filename and upload progress.
- Automatically parse text, tables, headers.
- Store in knowledge base for subsequent queries.

### 5.3 Report Generation

**🎭 Prototype Status:** ✅ Report display interface with simulated data and charts  
**🔮 Complete Version:**
- Automatically generate 3 sections: Summary / Data Analysis / Conclusions.
- Support export to PDF, Word.
- Reports embed charts.

### 5.4 Data Visualization

**🎭 Prototype Status:** ✅ Chart display components using simulated data  
**🔮 Complete Version:**
- Common chart types: bar charts, line charts, pie charts.
- Charts returned simultaneously with text answers.
- Support chart download as PNG.

### 5.5 Accessibility & Compliance

**🎭 Prototype Status:** ✅ **Fully Implemented** 
- ✅ Complies with WCAG 2.1 standards (contrast, keyboard operable).
- ✅ Supports screen readers.
- ✅ Site-wide language toggle button (EN / FR).

------

## 6. Page Prototype Scope & Element Description

### ✅ **Implemented Pages (Current Prototype)**

#### Page 1: Homepage ✅
- ✅ Logo + project title
- ✅ Feature showcase cards
- ✅ Quick entry → chat interface
- ✅ Modern responsive design

#### Page 2: Chat Interface ✅
- ✅ Clear conversation area
- ✅ Question input box + send button
- ✅ Answer display (Markdown support)
- ✅ Simulated chart display
- ✅ Copy, share, feedback functions

#### Page 3: Document Upload Page ✅
- ✅ File upload button (drag & drop support)
- ✅ File list display
- ✅ Upload progress indicator
- ✅ Usage guide and best practices

#### Page 4: Report Generation Page ✅
- ✅ Report title and structure
- ✅ Report content area (Summary / Analysis / Conclusions)
- ✅ Chart area (multiple chart types)
- ✅ Export button interface

#### Page 5: Settings Page ✅
- ✅ Language toggle (EN/FR)
- ✅ Theme selection (light/dark/auto)
- ✅ Accessibility options (font size, contrast)
- ✅ Reduced motion options

------

## 7. Functional Interaction Flow

### 🎭 **Current Prototype Flow**
1. ✅ User browses homepage → selects features → experiences various pages
2. ✅ User asks questions in chat interface → system returns simulated answers + charts
3. ✅ User tests document upload → views upload interface and progress display
4. ✅ User accesses report page → views analysis report template
5. ✅ User adjusts preferences in settings page → validates accessibility features

### 🚀 **Future Complete Version Flow**
1. User uploads PDF → system parses → stores in knowledge base.
2. User asks questions in chat interface → system queries knowledge base → returns real answers + charts.
3. User can choose "Generate Report" → system outputs summary + charts + conclusions → exportable.
4. User can switch languages or enable accessibility mode in settings page.

------

## 8. Data Input/Output

### 🎭 **Current Prototype**
- **Input**: User interaction testing
- **Output**: Simulated data display, interface responses

### 🚀 **Future Complete Version**
- **Input**:
  - PDF files
  - User questions (English/French)
- **Output**:
  - Text answers (Markdown format)
  - Visualization charts (PNG/SVG/HTML)
  - Report files (PDF/Word)

------

## 9. Non-Functional Requirements

### ✅ **Validated (Prototype Phase)**
- **Accessibility**: Fully compliant with WCAG 2.1 AA standards
- **Bilingual Support**: Complete English-French interface translation
- **Responsive Design**: Support for mobile and desktop
- **User Experience**: Modern, intuitive interface design

### 🔮 **To Be Implemented (Complete Version)**
- **Performance**:
  - Text Q&A < 3 seconds
  - Chart/report generation < 7 seconds
- **Security**:
  - Use only public data
  - No storage of user privacy information
- **Scalability**:
  - Future integration with databases / APIs

------

## 10. Success Criteria

### ✅ **Phase One Success Criteria (Achieved)**
- ✅ Deliver runnable high-fidelity prototype
- ✅ Meet basic bilingual and accessibility requirements
- ✅ Receive positive stakeholder feedback
- ✅ Validate design direction and user experience

### 🎯 **Final Success Criteria**
- Deliver a runnable complete PoC within the course cycle
- Support Q&A and analysis for at least 10 existing ED reports
- Meet all bilingual and accessibility requirements
- Pass municipal security and compliance review

------

## 11. Security & Authentication Requirements

### 🔐 **User Authentication System**

#### **Why Authentication is Required:**
1. **Government Security Standards** - Municipal data requires controlled access
2. **Document Security** - Uploaded reports may contain sensitive government information  
3. **User Accountability** - Track document uploads and report generation activities
4. **Personalized Experience** - User preferences and chat history management
5. **Role-Based Access Control** - Different permissions for researchers, analysts, and administrators

#### **Existing Infrastructure (Ready for Implementation):**
✅ **User Models:** Complete user management data structures  
✅ **Role System:** Three-tier access control (researcher/analyst/admin)  
✅ **User Preferences:** Language, theme, and notification settings  
✅ **Security Configuration:** JWT secret keys and session timeout settings  
✅ **User Repository:** Data access layer for user management  

#### **Required Implementation Components:**

**Phase 2A: Authentication API (Priority)**
```typescript
// Required API endpoints:
POST /api/v1/auth/login      // User login
POST /api/v1/auth/logout     // User logout  
POST /api/v1/auth/refresh    // Token refresh
GET  /api/v1/auth/me         // Current user info
```

**Phase 2B: Frontend Authentication**
```typescript
// Required components:
- LoginPage.tsx              // Login interface
- AuthContext.tsx            // Authentication state management
- ProtectedRoute.tsx         // Route protection
- UserProfile.tsx            // User profile management
```

**Phase 2C: Authorization Middleware**
```python
# API protection decorators:
@require_auth               # Authentication required
@require_role("researcher") # Role-based access
@require_permission("upload") # Permission-based access
```

#### **User Roles & Permissions:**

| Role | Document Upload | Chat Access | Report Generation | Admin Functions |
|------|----------------|-------------|-------------------|-----------------|
| **Researcher** | ✅ Yes | ✅ Yes | ✅ Basic Reports | ❌ No |
| **Analyst** | ✅ Yes | ✅ Yes | ✅ Advanced Reports | ❌ No |
| **Admin** | ✅ Yes | ✅ Yes | ✅ All Reports | ✅ Yes |

#### **Security Features:**
- **Session Management:** 60-minute timeout with refresh capability
- **Access Logging:** Track all document uploads and queries
- **Data Isolation:** Users see only their own chat history and uploaded documents
- **Government Compliance:** Meets municipal IT security requirements

#### **Implementation Strategy:**
1. **Simplified Start:** Username-based login (no passwords for internal tool)
2. **Pre-configured Users:** Use existing user database from `monk/users/users.json`
3. **Session Storage:** Simple session management without complex JWT refresh
4. **Progressive Enhancement:** Add password authentication in future phases

### 🔒 **Data Security & Privacy**

#### **Document Security:**
- **Access Control:** Only authenticated users can upload/view documents
- **User Isolation:** Documents are associated with specific user accounts
- **Audit Trail:** Log all document access and processing activities

#### **Chat History Security:**
- **User-Specific:** Each user has isolated chat history
- **Session-Based:** Chat history tied to authenticated sessions
- **Data Retention:** Configurable retention policies for chat data

------

## 📅 **Development Milestones**

### Completed ✅
- **September 2024**: High-fidelity frontend prototype
- **September 2024**: Render cloud deployment ready
- **September 2024**: Authentication requirements analysis

### Planned 🔄
- **October 2024**: User authentication system implementation
- **October 2024**: AI backend development begins
- **November 2024**: PDF parsing functionality integration
- **December 2024**: Complete system integration testing

### Future Plans 📋
- **Q1 2025**: Production environment deployment
- **Q2 2025**: User training and promotion 
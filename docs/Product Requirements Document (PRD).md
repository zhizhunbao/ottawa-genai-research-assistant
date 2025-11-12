# Ottawa GenAI Research Assistant - Product Requirements Document

**Project:** Ottawa Economic Development Team GenAI Research Assistant  
**Phase:** Phase 3 - AI Integration & Processing 🔄 **IN PROGRESS** | Next: Data Visualization & Trust Validation  
**Updated:** September 2026

---

## 🚀 **Executive Summary**

The Ottawa Economic Development team is developing a **Generative AI Research Assistant** in collaboration with Algonquin College. This internal tool enables municipal staff to analyze and summarize existing economic reports using natural language queries, generating structured analytical reports with data visualizations.

**Current Status:** Phase 2 authentication & backend ✅ **COMPLETED** - Full-stack application ready for AI integration and PDF processing.

**New Focus:** Building upon existing codebase (Kevin's architecture) to create an internal GenAI research assistant for economic development team's quarterly PDF reports analysis.

---

## 🎯 **Updated Project Objectives**

### **Phase 1 - Internal PDF Analysis** 🔄 **CURRENT FOCUS**

- **Objective**: Build an internal GenAI research assistant to help the economic development team quickly analyze and summarize existing economic reports
- **Data Scope**: Support 10-15 years of quarterly economic PDF reports (up to end of 2025)
- **Core Features**: Users can directly ask questions and receive text or chart answers based on these reports
- **Key Requirements**: Generate data visualizations (charts), ensure reliable answers (reduce hallucinations)

### **Phase 2 - External Data Integration** 📋 **PLANNED**

- **Expansion Scope**: External data sources (StatsCan, real estate reports, etc.)
- **Enhanced Features**: Supplement more economic indicators based on existing reports
- **Data Fusion**: Consider integrating public data sources (ottawa.ca, social media) with internal PDFs

### **Phase 3 - Advanced Analytics** 📋 **FUTURE**

- **Intelligent Analysis**: Cross-report trend analysis and forecasting
- **Automated Reporting**: Regularly generate comprehensive economic analysis reports
- **Decision Support**: Provide data-driven insights for policy making

---

## 📊 **Project Status Dashboard**

| Component | Status | Progress | Next Action |
|-----------|--------|----------|-------------|
| 🎨 **Frontend Prototype** | ✅ Complete | 100% | AI Feature Integration |
| 🔐 **Google OAuth Authentication** | ✅ Complete | 100% | Security Audit |
| 🚀 **FastAPI Backend** | ✅ Complete | 100% | AI Model Integration |
| 👥 **User Management** | ✅ Complete | 100% | Role-based Permissions |
| 🔑 **JWT Authentication** | ✅ Complete | 100% | Advanced Security Features |
| 🤖 **AI Backend** | 🔄 In Progress | 30% | PDF Processing Integration |
| 📄 **PDF Processing** | 🔄 In Progress | 20% | Vector Database Setup |
| 📊 **Data Visualization** | 📋 Planned | 0% | Chart Generation API |
| 🔍 **Trust Validation** | 📋 Planned | 0% | BLEU/ROUGE Implementation |
| 🚀 **Production Deployment** | 🔄 Ready | 95% | Final Security Review |

---

## 📂 **Data Scope & Management**

### **Phase 1 - Internal Documents** 🔄

- **Local PDF Reports**: 10-15 years of quarterly economic reports (up to end of 2025)
- **Storage Method**: Vector database + keyword search
- **Access Mode**: Offline analysis, no external network dependency

### **Phase 2 - External Sources** 📋

- **StatsCan Data**: Statistics Canada economic indicators
- **Real Estate Reports**: Market analysis and trend data
- **Business-specified PDFs**: Other relevant economic documents

### **Future Expansion** 🔮

- **ottawa.ca Content**: Public policies and reports
- **Social Media Data**: Public sentiment and feedback analysis
- **Real-time Data Sources**: Dynamic economic indicator integration

---

## ⚙️ **Technical Architecture (Updated)**

### **Architecture Based on Existing Codebase**

- **Development Approach**: Secondary development based on Kevin's existing codebase
- **Code Optimization**: Trim irrelevant modules (such as crawler functions)
- **Architecture Compatibility**: Maintain compatibility with City's internal architecture

### **Core Technology Stack**

- **Frontend**: Python + Streamlit (replacing original React solution)
- **Backend**: FastAPI + Python
- **Database**: Vector database (semantic search + keyword search)
- **AI Service**: Azure OpenAI (GPT-4, future upgrade to GPT-5)
- **Deployment**: Docker/Kubernetes
- **Security**: Key Vault for key management

### **AI & Processing Components**

- **Document Processing**: PDF parsing and content extraction
- **Vectorization**: Document embedding and semantic indexing
- **Query Engine**: Natural language understanding and retrieval
- **Visualization**: Automatic chart generation
- **Validation**: Trust assessment and hallucination detection

---

## 👥 **User Roles & Permissions**

| Role | Access Level | Capabilities |
|------|-------------|--------------|
| **🔬 Researcher** | Basic | Upload docs, basic chat, simple reports |
| **📊 Analyst** | Advanced | All researcher features + advanced reports |
| **⚙️ Admin** | Full | All features + user management |

**Target Users:**

- Primary: Economic Development team members
- Secondary: Other municipal departments (PoC validation)
- Future: Public residents (through portal)

---

## 🛠 **Feature Implementation Status**

### **Core Features (Phase 1)** 🔄

| Feature | Status | Description | Priority |
|---------|--------|-------------|----------|
| **📄 PDF Upload & Processing** | 🔄 In Progress | Batch upload and parse quarterly economic reports | P0 |
| **🔍 Semantic Search** | 🔄 In Progress | Vector database-based semantic retrieval | P0 |
| **💬 Natural Language Q&A** | 📋 Planned | Natural language query and answer generation | P0 |
| **📊 Auto Visualization** | 📋 Planned | Automatically generate appropriate charts and tables | P1 |
| **🔗 API Interface** | 📋 Planned | RESTful API for other systems to call | P1 |
| **🔒 Trust Validation** | 📋 Planned | BLEU, ROUGE, NLI validation methods | P1 |

### **Enhanced Features (Phase 2)** 📋

| Feature | Status | Description | Timeline |
|---------|--------|-------------|----------|
| **🌐 External Data Integration** | 📋 Planned | StatsCan, real estate data integration | Q2 2026 |
| **📈 Trend Analysis** | 📋 Planned | Cross-report trend analysis and prediction | Q3 2026 |
| **📋 Report Export** | 📋 Planned | PDF/Word format report export | Q2 2026 |
| **⚡ Real-time Updates** | 📋 Future | Real-time data source integration | Q4 2026 |

---

## 🔒 **Security & Compliance Requirements**

### **API Key Management**

- **Azure OpenAI**: API Key provided by City with usage and cost limits
- **Development Phase**: Students can use free OpenAI-compatible APIs for prototyping
- **Key Storage**: Secure management through Key Vault

### **Data Security**

- **Internal Data**: Access control for sensitive economic reports
- **Audit Logs**: Complete tracking of user operations
- **Compliance Requirements**: Meet government data security standards

### **Trust & Reliability**

- **Hallucination Detection**: Implement industry validation methods (BLEU, ROUGE, NLI, etc.)
- **Answer Attribution**: Provide data source references for answers
- **Confidence Scoring**: Provide credibility assessment for generated content

---

## 📈 **Success Metrics & Validation**

### **Phase 1 Targets** 🎯

- [ ] Successfully process 10-15 years of quarterly PDF reports
- [ ] Query response time < 3 seconds
- [ ] Visualization generation accuracy > 90%
- [ ] User satisfaction score > 4.0/5.0

### **Trust Validation Metrics**

- [ ] BLEU score > 0.7 (text quality)
- [ ] ROUGE score > 0.6 (summary accuracy)
- [ ] NLI consistency score > 0.8 (logical consistency)
- [ ] Hallucination detection accuracy > 85%

### **System Performance**

- [ ] API availability > 99.5%
- [ ] Concurrent user support > 50
- [ ] Data processing throughput > 100 PDFs/hour

---

## 📋 **Deliverables & Milestones**

### **Phase 1 Deliverables** 🎯

1. **Customized Tool**: PDF query and visualization system based on existing code
2. **API Interface Documentation**: Complete interface specifications and usage examples
3. **Trust Validation Report**: Research and implementation report on industry validation methods
4. **Demo Version**: Complete demonstration of chat interface + PDF answers + chart generation

### **Technical Deliverables**

- **Codebase**: Customized development based on existing architecture
- **Deployment Package**: Docker containers and K8s configuration files
- **Test Suite**: Automated testing and performance benchmarks
- **User Manual**: System usage and maintenance guide

### **Research Deliverables**

- **Trust Research**: Comparative analysis of BLEU, ROUGE, NLI and other validation methods
- **Best Practices**: Experience summary of GenAI applications in government departments
- **Optimization Recommendations**: System performance and user experience improvement suggestions

---

## 📅 **Updated Development Timeline**

### **Completed** ✅

- **Sep 2025**: High-fidelity prototype delivery
- **Sep 2025**: Accessibility and compliance validation
- **Sep 2025**: Stakeholder feedback collection
- **Jan 2026**: Google OAuth authentication system
- **Feb 2026**: Meeting requirements analysis and architecture adjustment

### **In Progress** 🔄

- **Q1 2026**: PDF processing and vector database integration
- **Q1 2026**: System transformation based on existing codebase

### **Planned** 📋

- **Q2 2026**: Natural language query and visualization features
- **Q2 2026**: Trust validation system implementation
- **Q2 2026**: API interface development and documentation

### **Future** 🔮

- **Q3 2026**: External data source integration (StatsCan, etc.)
- **Q4 2026**: Production environment deployment and user training

---

## 🔗 **Related Documentation**

- [Technical Architecture](./Technical%20Architecture.md)
- [User Authentication Design](./Authentication%20Requirements.md)
- [Accessibility Compliance Report](./Accessibility%20Report.md)
- [Project Status Report](./Project%20Status%20Report.md)

---

**Document Version:** 3.0  
**Last Updated:** September 26, 2026  
**Next Review:** October 15, 2026

## 📚 Related Documentation

### 🏠 Main Project
- [📖 Main README](../README.md) - Project overview and quick start guide

### 📋 English Documentation
- [🏗️ System Architecture Guide](./System%20Architecture%20Guide.md) - Complete system architecture
- [🗄️ Data Management Guide](./Data%20Management%20Guide.md) - Data management strategies and implementation
- [📊 Project Status Report](./Project%20Status%20Report.md) - Current project status and progress

# API Reference

**Last Updated:** ${new Date().toISOString().split('T')[0]}
**Status:** In Progress

## Overview

This document provides a reference for the Ottawa GenAI Research Assistant API endpoints.

## Base URL

- Production: `https://api.ottawa-genai.azurewebsites.net/api/v1`
- Development: `http://localhost:8000/api/v1`

## Endpoints

### Query

- **POST /query**
  - **Description:** Submit a natural language query to the RAG system.
  - **Payload:**
    ```json
    {
      "query": "string",
      "language": "en|fr"
    }
    ```

### Documents

- **GET /documents**
  - **Description:** Get a list of indexed documents.
- **POST /documents/upload**
  - **Description:** Upload a new PDF document.

---

_由 update-docs.js 自动生成_

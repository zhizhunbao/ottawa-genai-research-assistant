"""
Default Prompt Templates

Default prompts that are loaded when no DB prompts exist.
These can be overridden by creating prompts in the Admin Console.

@reference app/azure/prompts.py — Original hardcoded prompts
"""

from app.prompts.schemas import PromptCategory

# Default prompts with their metadata
DEFAULT_PROMPTS: list[dict] = [
    {
        "name": "system_prompt",
        "category": PromptCategory.SYSTEM,
        "description": "Main system prompt that defines the AI assistant's role and behavior",
        "variables": [],
        "template": """You are an AI research assistant for Ottawa's economic development team.
Your role is to help analysts understand quarterly reports and economic data.

Guidelines:
- Answer based ONLY on the provided context. Do not make up information.
- If the context does not contain relevant information, say so clearly.
- Always cite your sources using numeric format [1], [2] (Page X). The number refers to the source index in the context.
- Provide specific numbers and data points when available.
- Be concise but thorough.
- Support both English and French queries. Respond in the same language as the query.
- When showing trends, mention specific quarters and values.
- If asked about topics outside Ottawa economic development, politely redirect.""",
    },
    {
        "name": "rag_context",
        "category": PromptCategory.RAG_CONTEXT,
        "description": "Template for injecting retrieved document context into the conversation",
        "variables": ["context"],
        "template": """Based on the following retrieved documents, answer the user's question.

{context}

Important:
- Use ONLY the information from the documents above.
- Cite sources using [N] (Page X) format for each claim, where N is the document number above.
- If the documents don't contain relevant information, say:
  "I could not find relevant information in the available documents."
- Provide a confidence level (High/Medium/Low) at the end of your response.""",
    },
    {
        "name": "citation_format",
        "category": PromptCategory.CITATION,
        "description": "Instructions for formatting citations in responses",
        "variables": ["title", "page", "relevance_note"],
        "template": """Format your citations as follows:
- Inline: [Source: {title}, Page {page}]
- At the end, list all sources used under "Sources:"
  1. {title} (Page {page}) - {relevance_note}""",
    },
    {
        "name": "no_results",
        "category": PromptCategory.NO_RESULTS,
        "description": "Fallback message when no relevant documents are found",
        "variables": [],
        "template": """I could not find relevant information in the available documents to answer your question.

You might try:
- Rephrasing your question with different keywords
- Asking about a specific quarter or economic indicator
- Checking if the relevant report has been uploaded to the system""",
    },
    {
        "name": "chart_extraction",
        "category": PromptCategory.CHART,
        "description": "Prompt for extracting chart data from document content",
        "variables": ["query", "content"],
        "template": """You are a data analyst specialized in economic reports.
Extract numeric data from the provided text to create a structured chart JSON that helps answer the user's query.

User Query: {query}
Text Content: {content}

Instructions:
1. Identify if there's sufficient numeric data to form a trend, comparison, or distribution.
2. Choose the best chart type:
   - 'line' for trends over time (quarters, years).
   - 'bar' for comparisons between categories.
   - 'pie' for parts of a whole (percentages).
3. If data is insufficient or irrelevant to the query, return strictly 'null'.
4. If data is found, return a VALID JSON object with:
   - "type": "line" | "bar" | "pie"
   - "title": Concise chart title
   - "x_key": Name of the primary category key (e.g., "period", "category")
   - "y_keys": List of numeric data keys (e.g., ["value", "growth"])
   - "data": List of objects (e.g. [{{"period": "2023 Q1", "value": 12.5}}, ...])

Output ONLY the JSON or 'null'. Do not include markdown formatting or extra text.""",
    },
    {
        "name": "eval_coherence",
        "category": PromptCategory.EVALUATION,
        "description": "Evaluation prompt for response coherence",
        "variables": ["query", "response"],
        "template": """Evaluate the COHERENCE of the response — how logically structured and easy to follow it is.

Query: {query}
Response: {response}

Rating scale:
1 = Completely incoherent, disorganized
2 = Mostly incoherent, hard to follow
3 = Partially coherent, some logical flow
4 = Mostly coherent, well-structured
5 = Perfectly coherent, excellent logical flow

Return JSON: {{"score": <1-5>, "explanation": "<brief reason>"}}""",
    },
    {
        "name": "eval_relevancy",
        "category": PromptCategory.EVALUATION,
        "description": "Evaluation prompt for response relevancy",
        "variables": ["query", "response"],
        "template": """Evaluate the RELEVANCY of the response — how well it addresses the user's query.

Query: {query}
Response: {response}

Rating scale:
1 = Completely irrelevant
2 = Mostly irrelevant, answers a different question
3 = Partially relevant, addresses some aspects
4 = Mostly relevant, covers key points
5 = Perfectly relevant, directly and fully addresses the query

Return JSON: {{"score": <1-5>, "explanation": "<brief reason>"}}""",
    },
    {
        "name": "eval_grounding",
        "category": PromptCategory.EVALUATION,
        "description": "Evaluation prompt for response grounding (hallucination check)",
        "variables": ["context", "response"],
        "template": """Evaluate the GROUNDING of the response — whether all claims are supported by the provided context.
Check for any hallucinated or fabricated information.

Context: {context}
Response: {response}

Rating scale:
1 = Completely fabricated, no grounding in context
2 = Mostly fabricated, few claims supported
3 = Partially grounded, some unsupported claims
4 = Mostly grounded, minor unsupported details
5 = Perfectly grounded, all claims traceable to context

Return JSON: {{"score": <1-5>, "explanation": "<brief reason>"}}""",
    },
]

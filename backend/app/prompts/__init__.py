"""
Prompts Module

Prompt template management for Admin Console.
Stores prompts in database with version history.
"""

from app.prompts.service import PromptService

__all__ = ["PromptService"]

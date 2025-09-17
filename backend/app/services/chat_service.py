"""
💬 Chat Service

Handles AI-powered chat interactions and context management.
"""

import openai
from typing import Dict, List, Optional, Any
from app.core.config import Settings
import json


class ChatService:
    """Service for handling AI chat interactions."""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.openai_client = None
        
        # Initialize OpenAI client if API key is available
        if settings.OPENAI_API_KEY:
            openai.api_key = settings.OPENAI_API_KEY
            self.openai_client = openai
    
    async def process_message(
        self,
        message: str,
        language: Optional[str] = "en",
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process a user message and generate an AI response.
        
        Args:
            message: User's input message
            language: Language preference (en/fr)
            context: Additional context for the conversation
            
        Returns:
            Dictionary containing the AI response and metadata
        """
        try:
            # For now, return mock data if no OpenAI key is configured
            if not self.openai_client:
                return await self._generate_mock_response(message, language)
            
            # Prepare the system prompt
            system_prompt = self._build_system_prompt(language)
            
            # Build messages for OpenAI
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ]
            
            # Add context if provided
            if context:
                messages.insert(1, {"role": "assistant", "content": f"Context: {context}"})
            
            # Call OpenAI API
            response = await self.openai_client.ChatCompletion.acreate(
                model=self.settings.DEFAULT_AI_MODEL,
                messages=messages,
                max_tokens=self.settings.MAX_TOKENS,
                temperature=self.settings.TEMPERATURE,
            )
            
            ai_response = response.choices[0].message.content
            
            # Parse response for sources and charts
            parsed_response = self._parse_ai_response(ai_response)
            
            return {
                "text": parsed_response["text"],
                "sources": parsed_response.get("sources", []),
                "charts": parsed_response.get("charts"),
                "language": language
            }
            
        except Exception as e:
            # Fallback to mock response on error
            return await self._generate_mock_response(message, language, error=str(e))
    
    def _build_system_prompt(self, language: str) -> str:
        """Build the system prompt based on language and context."""
        
        if language == "fr":
            return """
            Vous êtes un assistant de recherche IA spécialisé dans le développement économique 
            pour la Ville d'Ottawa. Votre rôle est d'aider les employés municipaux à analyser 
            des documents, générer des rapports et répondre à des questions sur le développement 
            économique.
            
            Directives:
            - Répondez en français
            - Soyez précis et professionnel
            - Citez vos sources quand possible
            - Proposez des visualisations de données pertinentes
            - Respectez les standards d'accessibilité et de bilinguisme du gouvernement
            """
        else:
            return """
            You are an AI research assistant specialized in economic development for the City of Ottawa. 
            Your role is to help municipal employees analyze documents, generate reports, and answer 
            questions about economic development.
            
            Guidelines:
            - Respond in English
            - Be precise and professional
            - Cite your sources when possible
            - Suggest relevant data visualizations
            - Adhere to government accessibility and bilingual standards
            """
    
    def _parse_ai_response(self, response: str) -> Dict[str, Any]:
        """Parse AI response to extract text, sources, and chart suggestions."""
        
        # Simple parsing logic - in production, this would be more sophisticated
        result = {
            "text": response,
            "sources": [],
            "charts": None
        }
        
        # Look for source citations (this is a simple example)
        if "[Source:" in response:
            # Extract sources from response
            import re
            sources = re.findall(r'\[Source: (.*?)\]', response)
            result["sources"] = sources
            # Remove source citations from display text
            result["text"] = re.sub(r'\[Source: .*?\]', '', response).strip()
        
        # Look for chart suggestions
        if "chart" in response.lower() or "graph" in response.lower():
            # This is a placeholder - real implementation would analyze the content
            result["charts"] = {
                "suggested": True,
                "type": "bar",
                "title": "Economic Indicators",
                "data": {"labels": ["Q1", "Q2", "Q3"], "values": [100, 120, 135]}
            }
        
        return result
    
    async def _generate_mock_response(
        self,
        message: str,
        language: str,
        error: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a mock response when AI is not available."""
        
        # Sample responses based on common questions
        mock_responses = {
            "en": {
                "economic": "Based on the latest Q3 Economic Development Update, Ottawa's economy shows strong growth with a 3.2% increase in business registrations and continued expansion in the technology sector. Key indicators include increased employment rates and new infrastructure investments.",
                "business": "The City of Ottawa offers several business support programs including the Small Business Development Fund, which has provided over $2.5M in support this year. Programs focus on startup assistance, expansion grants, and skills development.",
                "default": "Thank you for your question about Ottawa's economic development. Based on available data and reports, I can provide comprehensive analysis and insights. Would you like me to generate a detailed report on this topic?"
            },
            "fr": {
                "economic": "Selon la dernière mise à jour du développement économique du T3, l'économie d'Ottawa montre une forte croissance avec une augmentation de 3,2% des enregistrements d'entreprises et une expansion continue du secteur technologique.",
                "business": "La Ville d'Ottawa offre plusieurs programmes de soutien aux entreprises, notamment le Fonds de développement des petites entreprises, qui a fourni plus de 2,5 M$ de soutien cette année.",
                "default": "Merci pour votre question sur le développement économique d'Ottawa. Basé sur les données et rapports disponibles, je peux fournir une analyse et des perspectives complètes."
            }
        }
        
        # Determine response type based on message content
        message_lower = message.lower()
        if any(word in message_lower for word in ["economic", "economy", "économique"]):
            response_key = "economic"
        elif any(word in message_lower for word in ["business", "entreprise", "support"]):
            response_key = "business"
        else:
            response_key = "default"
        
        response_text = mock_responses[language][response_key]
        
        # Add error note if applicable
        if error:
            error_note = " (Note: AI service temporarily unavailable - showing sample response)" if language == "en" else " (Note: Service IA temporairement indisponible - réponse d'exemple)"
            response_text += error_note
        
        return {
            "text": response_text,
            "sources": ["Q3 Economic Development Update", "Business Support Program Report"],
            "charts": {
                "type": "line",
                "title": "Economic Growth Trend" if language == "en" else "Tendance de croissance économique",
                "data": {
                    "labels": ["Q1 2024", "Q2 2024", "Q3 2024"],
                    "values": [100, 105, 112]
                }
            },
            "language": language
        } 
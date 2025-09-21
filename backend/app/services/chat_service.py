"""
💬 Chat Service

Handles AI-powered chat interactions and context management.
"""

import json
from pathlib import Path
from typing import Any

from openai import AsyncOpenAI

from app.core.config import Settings


class ChatService:
    """Service for handling AI chat interactions."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.openai_client = None
        self.monk_data_path = Path("monk")

        # Initialize OpenAI client if API key is available
        if settings.OPENAI_API_KEY:
            self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def process_message(
        self,
        message: str,
        language: str | None = "en",
        context: str | None = None,
    ) -> dict[str, Any]:
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
                {"role": "user", "content": message},
            ]

            # Add context if provided
            if context:
                messages.insert(
                    1, {"role": "assistant", "content": f"Context: {context}"}
                )

                # Call OpenAI API
            response = await self.openai_client.chat.completions.create(
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
                "language": language,
            }

        except Exception as e:
            # Fallback to mock response on error
            return await self._generate_mock_response(message, language, error=str(e))

    def _build_system_prompt(self, language: str) -> str:
        """Build the system prompt based on language and context."""

        if language == "fr":
            return """
            Vous êtes un assistant de recherche IA spécialisé dans le
            développement économique pour la Ville d'Ottawa. Votre rôle est
            d'aider les employés municipaux à analyser des documents,
            générer des rapports et répondre à des questions sur le
            développement économique.

            Directives:
            - Répondez en français
            - Soyez précis et professionnel
            - Citez vos sources quand possible
            - Proposez des visualisations de données pertinentes
            - Respectez les standards d'accessibilité et de bilinguisme
              du gouvernement
            """
        else:
            return """
            You are an AI research assistant specialized in economic
            development for the City of Ottawa. Your role is to help
            municipal employees analyze documents, generate reports, and
            answer questions about economic development.

            Guidelines:
            - Respond in English
            - Be precise and professional
            - Cite your sources when possible
            - Suggest relevant data visualizations
            - Adhere to government accessibility and bilingual standards
            """

    def _parse_ai_response(self, response: str) -> dict[str, Any]:
        """Parse AI response to extract text, sources, and chart
        suggestions."""

        # Simple parsing logic - in production, this would be more
        # sophisticated
        result = {"text": response, "sources": [], "charts": None}

        # Look for source citations (this is a simple example)
        if "[Source:" in response:
            # Extract sources from response
            import re

            sources = re.findall(r"\[Source: (.*?)\]", response)
            result["sources"] = sources
            # Remove source citations from display text
            result["text"] = re.sub(r"\[Source: .*?\]", "", response).strip()

        # Look for chart suggestions
        if "chart" in response.lower() or "graph" in response.lower():
            # This is a placeholder - real implementation would analyze the
            # content
            result["charts"] = {
                "suggested": True,
                "type": "bar",
                "title": "Economic Indicators",
                "data": {"labels": ["Q1", "Q2", "Q3"], "values": [100, 120, 135]},
            }

        return result

    async def _load_monk_data(self) -> dict[str, Any]:
        """Load data from monk directory."""
        data = {
            "economic_reports": [],
            "business_programs": [],
            "statistics": {},
        }

        try:
            # Load economic reports
            reports_path = self.monk_data_path / "economic_reports"
            if reports_path.exists():
                for file_path in reports_path.glob("*.json"):
                    with open(file_path, encoding="utf-8") as f:
                        report_data = json.load(f)
                        data["economic_reports"].append(report_data)

            # Load business programs
            programs_path = self.monk_data_path / "business_programs"
            if programs_path.exists():
                for file_path in programs_path.glob("*.json"):
                    with open(file_path, encoding="utf-8") as f:
                        program_data = json.load(f)
                        data["business_programs"].append(program_data)

            # Load statistics
            stats_path = self.monk_data_path / "statistics" / "latest.json"
            if stats_path.exists():
                with open(stats_path, encoding="utf-8") as f:
                    data["statistics"] = json.load(f)

        except Exception as e:
            print(f"Error loading monk data: {e}")

        return data

    async def _generate_mock_response(
        self, message: str, language: str, error: str | None = None
    ) -> dict[str, Any]:
        """Generate a mock response when AI is not available."""

        # Load actual data from monk directory
        monk_data = await self._load_monk_data()

        # Generate response based on available data
        response_text = self._generate_response_from_data(message, language, monk_data)

        # Add error note if applicable
        if error:
            error_note = (
                " (Note: AI service temporarily unavailable - showing "
                "data-based response)"
                if language == "en"
                else " (Note: Service IA temporairement indisponible - "
                "réponse basée sur les données)"
            )
            response_text += error_note

        # Extract sources from loaded data
        sources = []
        if monk_data["economic_reports"]:
            sources.extend(
                [
                    report.get("title", "Economic Report")
                    for report in monk_data["economic_reports"][:3]
                ]
            )
        if monk_data["business_programs"]:
            sources.extend(
                [
                    program.get("name", "Business Program")
                    for program in monk_data["business_programs"][:2]
                ]
            )

        # Generate charts based on available statistics
        charts = None
        if monk_data["statistics"]:
            stats_data = monk_data["statistics"]
            charts = self._generate_chart_from_stats(stats_data, language)

        return {
            "text": response_text,
            "sources": sources if sources else ["Local Data Repository"],
            "charts": charts,
            "language": language,
        }

    def _generate_response_from_data(
        self, message: str, language: str, data: dict[str, Any]
    ) -> str:
        """Generate response based on loaded monk data."""

        message_lower = message.lower()

        # Check for economic-related queries
        if any(
            word in message_lower
            for word in ["economic", "economy", "économique", "growth", "croissance"]
        ):
            if data["economic_reports"]:
                latest_report = data["economic_reports"][0]
                if language == "fr":
                    title = latest_report.get("title", "Rapport économique")
                    summary = latest_report.get(
                        "summary_fr",
                        "les données montrent une croissance positive.",
                    )
                    return f"Selon le dernier rapport économique '{title}', {summary}"
                else:
                    title = latest_report.get("title", "Economic Report")
                    summary = latest_report.get(
                        "summary_en",
                        "data shows positive growth across multiple sectors.",
                    )
                    return (
                        f"According to the latest economic report '{title}', {summary}"
                    )

        # Check for business program queries
        elif any(
            word in message_lower
            for word in ["business", "entreprise", "program", "programme", "support"]
        ):
            if data["business_programs"]:
                programs = data["business_programs"][:3]
                if language == "fr":
                    program_list = ", ".join(
                        [p.get("name_fr", p.get("name", "Programme")) for p in programs]
                    )
                    return (
                        f"La Ville d'Ottawa offre plusieurs programmes de "
                        f"soutien aux entreprises, notamment: {program_list}. "
                        f"Ces programmes ont aidé de nombreuses entreprises "
                        f"locales cette année."
                    )
                else:
                    program_list = ", ".join(
                        [p.get("name_en", p.get("name", "Program")) for p in programs]
                    )
                    return (
                        f"The City of Ottawa offers several business support "
                        f"programs including: {program_list}. These programs "
                        f"have assisted numerous local businesses this year."
                    )

        # Default response
        if language == "fr":
            return (
                "Merci pour votre question sur le développement économique "
                "d'Ottawa. Basé sur nos données locales, je peux fournir "
                "une analyse détaillée. Que souhaiteriez-vous savoir "
                "spécifiquement?"
            )
        else:
            return (
                "Thank you for your question about Ottawa's economic "
                "development. Based on our local data, I can provide "
                "detailed analysis. What specific information would you "
                "like to know?"
            )

    def _generate_chart_from_stats(
        self, stats: dict[str, Any], language: str
    ) -> dict[str, Any] | None:
        """Generate chart configuration from statistics data."""

        if not stats:
            return None

        # Look for chart-worthy data in statistics
        chart_data = None
        chart_title = "Economic Indicators"

        if "quarterly_growth" in stats:
            chart_data = {
                "labels": list(stats["quarterly_growth"].keys()),
                "values": list(stats["quarterly_growth"].values()),
            }
            chart_title = (
                "Quarterly Growth" if language == "en" else "Croissance trimestrielle"
            )
        elif "sector_performance" in stats:
            chart_data = {
                "labels": list(stats["sector_performance"].keys()),
                "values": list(stats["sector_performance"].values()),
            }
            chart_title = (
                "Sector Performance" if language == "en" else "Performance par secteur"
            )

        if chart_data:
            return {
                "type": "bar",
                "title": chart_title,
                "data": chart_data,
            }

        return None

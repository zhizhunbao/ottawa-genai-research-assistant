"""
📄 Template Service

Service for rendering report templates with variable substitution.
"""

from pathlib import Path
from typing import Any, Dict, Optional

from jinja2 import Environment, FileSystemLoader, TemplateNotFound
from loguru import logger


class TemplateService:
    """Service for rendering report templates."""

    def __init__(self, template_dir: Optional[str] = None):
        """
        Initialize template service.

        Args:
            template_dir: Directory containing templates (default: app/templates/reports)
        """
        if template_dir is None:
            # Default template directory
            template_dir = str(Path(__file__).parent.parent / "templates" / "reports")

        self.template_dir = Path(template_dir)
        self.template_dir.mkdir(parents=True, exist_ok=True)

        # Initialize Jinja2 environment
        self.env = Environment(
            loader=FileSystemLoader(str(self.template_dir)),
            autoescape=True,
            trim_blocks=True,
            lstrip_blocks=True,
        )

        # Create default templates if they don't exist
        self._create_default_templates()

    def _create_default_templates(self):
        """Create default templates if they don't exist."""
        default_templates = {
            "default.html": self._get_default_html_template(),
            "executive_summary.html": self._get_executive_summary_template(),
            "detailed_analysis.html": self._get_detailed_analysis_template(),
        }

        for template_name, template_content in default_templates.items():
            template_path = self.template_dir / template_name
            if not template_path.exists():
                template_path.write_text(template_content, encoding="utf-8")
                logger.info(f"Created default template: {template_name}")

    def render_template(
        self,
        template_name: str,
        context: Dict[str, Any],
        language: str = "en",
    ) -> str:
        """
        Render a template with the given context.

        Args:
            template_name: Name of the template file
            context: Dictionary of variables to substitute
            language: Language code (en, fr)

        Returns:
            Rendered template string
        """
        try:
            # Try to load language-specific template first
            lang_template_name = f"{template_name.rsplit('.', 1)[0]}_{language}.{template_name.rsplit('.', 1)[1]}"
            try:
                template = self.env.get_template(lang_template_name)
            except TemplateNotFound:
                # Fall back to default template
                template = self.env.get_template(template_name)

            # Add language to context
            context["language"] = language

            # Render template
            rendered = template.render(**context)

            return rendered

        except TemplateNotFound:
            logger.error(f"Template not found: {template_name}")
            # Return a simple fallback
            return self._render_fallback(context, language)
        except Exception as e:
            logger.error(f"Error rendering template {template_name}: {e}")
            return self._render_fallback(context, language)

    def _render_fallback(self, context: Dict[str, Any], language: str) -> str:
        """Render a simple fallback template."""
        title = context.get("title", "Report")
        summary = context.get("summary", "")
        sections = context.get("sections", [])

        html = f"""
        <!DOCTYPE html>
        <html lang="{language}">
        <head>
            <meta charset="UTF-8">
            <title>{title}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }}
                h1 {{ color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }}
                h2 {{ color: #34495e; margin-top: 30px; }}
                .metadata {{ background: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; }}
                .section {{ margin: 20px 0; padding: 15px; background: #ffffff; border-left: 4px solid #3498db; }}
                .sources {{ margin-top: 30px; padding: 15px; background: #e8f4f8; border-radius: 5px; }}
            </style>
        </head>
        <body>
            <h1>{title}</h1>
            <div class="metadata">
                <p><strong>Generated:</strong> {context.get('generated_at', 'N/A')}</p>
                <p><strong>Language:</strong> {language.upper()}</p>
            </div>
            <h2>Summary</h2>
            <p>{summary}</p>
        """

        for section in sections:
            html += f"""
            <div class="section">
                <h2>{section.get('title', 'Section')}</h2>
                <p>{section.get('content', '')}</p>
            </div>
            """

        if context.get("sources"):
            html += """
            <div class="sources">
                <h2>Sources</h2>
                <ul>
            """
            for source in context.get("sources", []):
                html += f"<li>{source}</li>"
            html += """
                </ul>
            </div>
            """

        html += """
        </body>
        </html>
        """

        return html

    def _get_default_html_template(self) -> str:
        """Get default HTML template content."""
        return """<!DOCTYPE html>
<html lang="{{ language }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            border-bottom: 4px solid #3498db;
            padding-bottom: 15px;
            margin-bottom: 30px;
        }
        h2 {
            color: #34495e;
            margin-top: 40px;
            margin-bottom: 20px;
            border-left: 4px solid #3498db;
            padding-left: 15px;
        }
        .metadata {
            background: #f8f9fa;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }
        .section {
            margin: 30px 0;
            padding: 20px;
            background: #ffffff;
            border-left: 4px solid #3498db;
            border-radius: 4px;
        }
        .sources {
            margin-top: 40px;
            padding: 20px;
            background: #e8f4f8;
            border-radius: 8px;
        }
        .sources ul {
            list-style: none;
            padding-left: 0;
        }
        .sources li {
            padding: 8px 0;
            border-bottom: 1px solid #bdc3c7;
        }
        .chart-container {
            margin: 20px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>{{ title }}</h1>
        
        <div class="metadata">
            <p><strong>Generated:</strong> {{ generated_at }}</p>
            <p><strong>Language:</strong> {{ language|upper }}</p>
            {% if author %}
            <p><strong>Author:</strong> {{ author }}</p>
            {% endif %}
        </div>

        <h2>Executive Summary</h2>
        <div class="section">
            <p>{{ summary }}</p>
        </div>

        {% for section in sections %}
        <div class="section">
            <h2>{{ section.title }}</h2>
            <p>{{ section.content }}</p>
            
            {% if section.charts %}
            <div class="chart-container">
                <h3>Charts</h3>
                {% for chart in section.charts %}
                <div id="chart-{{ loop.index }}" style="margin: 20px 0;"></div>
                {% endfor %}
            </div>
            {% endif %}
        </div>
        {% endfor %}

        {% if sources %}
        <div class="sources">
            <h2>Sources</h2>
            <ul>
                {% for source in sources %}
                <li>{{ source }}</li>
                {% endfor %}
            </ul>
        </div>
        {% endif %}
    </div>

    {% if charts_data %}
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <script>
        {% for chart in charts_data %}
        Plotly.newPlot('chart-{{ loop.index }}', {{ chart.data|safe }}, {{ chart.config|safe }});
        {% endfor %}
    </script>
    {% endif %}
</body>
</html>
"""

    def _get_executive_summary_template(self) -> str:
        """Get executive summary template content."""
        return """<!DOCTYPE html>
<html lang="{{ language }}">
<head>
    <meta charset="UTF-8">
    <title>{{ title }} - Executive Summary</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #2c3e50; }
        .summary { background: #f8f9fa; padding: 20px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>{{ title }}</h1>
    <div class="summary">
        <h2>Executive Summary</h2>
        <p>{{ summary }}</p>
    </div>
    {% if key_findings %}
    <h2>Key Findings</h2>
    <ul>
        {% for finding in key_findings %}
        <li>{{ finding }}</li>
        {% endfor %}
    </ul>
    {% endif %}
</body>
</html>
"""

    def _get_detailed_analysis_template(self) -> str:
        """Get detailed analysis template content."""
        return """<!DOCTYPE html>
<html lang="{{ language }}">
<head>
    <meta charset="UTF-8">
    <title>{{ title }} - Detailed Analysis</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #2c3e50; }
        .section { margin: 30px 0; padding: 20px; background: #f8f9fa; }
    </style>
</head>
<body>
    <h1>{{ title }}</h1>
    <h2>Detailed Analysis</h2>
    {% for section in sections %}
    <div class="section">
        <h3>{{ section.title }}</h3>
        <p>{{ section.content }}</p>
    </div>
    {% endfor %}
</body>
</html>
"""

    def list_available_templates(self) -> list[str]:
        """List all available templates."""
        templates = []
        if self.template_dir.exists():
            for template_file in self.template_dir.glob("*.html"):
                templates.append(template_file.name)
        return templates


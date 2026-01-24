"""
📊 Visualization Service

Service for extracting data from documents and generating charts using Plotly.
"""

import json
import re
from typing import Any, Dict, List, Optional

import plotly.graph_objects as go
from loguru import logger
from plotly.utils import PlotlyJSONEncoder


class VisualizationService:
    """Service for data visualization and chart generation."""

    def __init__(self):
        """Initialize visualization service."""
        self.supported_chart_types = [
            "bar",
            "line",
            "pie",
            "scatter",
            "area",
            "table",
        ]

    def extract_data_from_text(
        self, text: str, data_type: str = "numeric"
    ) -> Dict[str, Any]:
        """
        Extract structured data from text content.

        Args:
            text: Text content to extract data from
            data_type: Type of data to extract (numeric, percentage, currency, date)

        Returns:
            Dictionary with extracted data
        """
        extracted_data = {
            "values": [],
            "labels": [],
            "dates": [],
            "percentages": [],
            "currencies": [],
        }

        try:
            # Extract percentages (e.g., "15%", "23.5%")
            percentage_pattern = r"(\d+\.?\d*)\s*%"
            percentages = re.findall(percentage_pattern, text)
            extracted_data["percentages"] = [
                float(p) for p in percentages if float(p) <= 100
            ]

            # Extract currency values (e.g., "$1,234.56", "$5M", "$2.5B")
            currency_pattern = r"\$[\d,]+(?:\.\d+)?[MBK]?"
            currencies = re.findall(currency_pattern, text)
            extracted_data["currencies"] = currencies

            # Extract numeric values
            numeric_pattern = r"\b(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\b"
            numbers = re.findall(numeric_pattern, text)
            # Convert to float, removing commas
            extracted_data["values"] = [
                float(n.replace(",", "")) for n in numbers[:20]
            ]  # Limit to 20 values

            # Extract dates (e.g., "2024", "Q1 2024", "January 2024")
            date_pattern = r"(?:Q[1-4]\s+)?\d{4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}"
            dates = re.findall(date_pattern, text, re.IGNORECASE)
            extracted_data["dates"] = dates[:10]  # Limit to 10 dates

            # Extract labels (words before numbers, percentages, or currencies)
            label_pattern = r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?::|\-)?\s*(?:\$|\d|%)"
            labels = re.findall(label_pattern, text)
            extracted_data["labels"] = list(set(labels))[:10]  # Limit to 10 unique labels

        except Exception as e:
            logger.error(f"Error extracting data from text: {e}")
            return extracted_data

        return extracted_data

    def suggest_chart_type(
        self, data: Dict[str, Any], context: Optional[str] = None
    ) -> str:
        """
        Suggest the best chart type based on data characteristics.

        Args:
            data: Extracted data dictionary
            context: Optional context about the data

        Returns:
            Suggested chart type
        """
        values = data.get("values", [])
        labels = data.get("labels", [])
        dates = data.get("dates", [])
        percentages = data.get("percentages", [])

        # If we have dates, suggest line or area chart
        if len(dates) >= 2:
            return "line"

        # If we have percentages that sum to ~100, suggest pie chart
        if percentages and abs(sum(percentages) - 100) < 5:
            return "pie"

        # If we have labels and values, suggest bar chart
        if labels and values and len(labels) == len(values):
            return "bar"

        # If we have many values, suggest line chart
        if len(values) >= 5:
            return "line"

        # Default to bar chart
        return "bar"

    def generate_chart(
        self,
        chart_type: str,
        data: Dict[str, Any],
        title: str = "Chart",
        x_label: Optional[str] = None,
        y_label: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate a Plotly chart.

        Args:
            chart_type: Type of chart (bar, line, pie, scatter, area, table)
            data: Data dictionary with labels, values, etc.
            title: Chart title
            x_label: X-axis label
            y_label: Y-axis label

        Returns:
            Dictionary with chart JSON and metadata
        """
        try:
            labels = data.get("labels", [])
            values = data.get("values", [])
            dates = data.get("dates", [])
            percentages = data.get("percentages", [])

            # Use percentages if available, otherwise use values
            chart_values = percentages if percentages else values

            # Use dates as labels if available, otherwise use labels
            chart_labels = dates if dates else labels

            # Ensure we have data
            if not chart_values:
                logger.warning("No data available for chart generation")
                return self._create_empty_chart(title)

            # Limit data size for better performance
            if len(chart_values) > 20:
                chart_values = chart_values[:20]
                chart_labels = chart_labels[:20] if chart_labels else None

            # Generate chart based on type
            if chart_type == "bar":
                fig = self._create_bar_chart(
                    chart_labels or [f"Item {i+1}" for i in range(len(chart_values))],
                    chart_values,
                    title,
                    x_label,
                    y_label,
                )
            elif chart_type == "line":
                fig = self._create_line_chart(
                    chart_labels or [f"Item {i+1}" for i in range(len(chart_values))],
                    chart_values,
                    title,
                    x_label,
                    y_label,
                )
            elif chart_type == "pie":
                fig = self._create_pie_chart(
                    chart_labels or [f"Item {i+1}" for i in range(len(chart_values))],
                    chart_values,
                    title,
                )
            elif chart_type == "area":
                fig = self._create_area_chart(
                    chart_labels or [f"Item {i+1}" for i in range(len(chart_values))],
                    chart_values,
                    title,
                    x_label,
                    y_label,
                )
            elif chart_type == "scatter":
                fig = self._create_scatter_chart(
                    chart_labels or [f"Item {i+1}" for i in range(len(chart_values))],
                    chart_values,
                    title,
                    x_label,
                    y_label,
                )
            elif chart_type == "table":
                fig = self._create_table_chart(
                    chart_labels or [f"Item {i+1}" for i in range(len(chart_values))],
                    chart_values,
                    title,
                )
            else:
                logger.warning(f"Unsupported chart type: {chart_type}, using bar chart")
                fig = self._create_bar_chart(
                    chart_labels or [f"Item {i+1}" for i in range(len(chart_values))],
                    chart_values,
                    title,
                    x_label,
                    y_label,
                )

            # Convert to JSON
            chart_json = json.dumps(fig, cls=PlotlyJSONEncoder)

            return {
                "type": chart_type,
                "title": title,
                "data": chart_json,
                "config": {
                    "displayModeBar": True,
                    "responsive": True,
                },
            }

        except Exception as e:
            logger.error(f"Error generating chart: {e}")
            return self._create_empty_chart(title)

    def _create_bar_chart(
        self, labels: List[str], values: List[float], title: str, x_label: Optional[str], y_label: Optional[str]
    ) -> Dict[str, Any]:
        """Create a bar chart."""
        fig = go.Figure(
            data=[
                go.Bar(
                    x=labels,
                    y=values,
                    marker_color="rgb(55, 83, 109)",
                    text=values,
                    textposition="auto",
                )
            ]
        )
        fig.update_layout(
            title=title,
            xaxis_title=x_label or "Category",
            yaxis_title=y_label or "Value",
            template="plotly_white",
            height=400,
        )
        return fig.to_dict()

    def _create_line_chart(
        self, labels: List[str], values: List[float], title: str, x_label: Optional[str], y_label: Optional[str]
    ) -> Dict[str, Any]:
        """Create a line chart."""
        fig = go.Figure(
            data=[
                go.Scatter(
                    x=labels,
                    y=values,
                    mode="lines+markers",
                    line=dict(color="rgb(55, 83, 109)", width=3),
                    marker=dict(size=8),
                )
            ]
        )
        fig.update_layout(
            title=title,
            xaxis_title=x_label or "Time",
            yaxis_title=y_label or "Value",
            template="plotly_white",
            height=400,
        )
        return fig.to_dict()

    def _create_pie_chart(
        self, labels: List[str], values: List[float], title: str
    ) -> Dict[str, Any]:
        """Create a pie chart."""
        fig = go.Figure(
            data=[
                go.Pie(
                    labels=labels,
                    values=values,
                    hole=0.3,
                    textinfo="label+percent",
                )
            ]
        )
        fig.update_layout(
            title=title,
            template="plotly_white",
            height=400,
        )
        return fig.to_dict()

    def _create_area_chart(
        self, labels: List[str], values: List[float], title: str, x_label: Optional[str], y_label: Optional[str]
    ) -> Dict[str, Any]:
        """Create an area chart."""
        fig = go.Figure(
            data=[
                go.Scatter(
                    x=labels,
                    y=values,
                    mode="lines",
                    fill="tozeroy",
                    line=dict(color="rgb(55, 83, 109)"),
                )
            ]
        )
        fig.update_layout(
            title=title,
            xaxis_title=x_label or "Time",
            yaxis_title=y_label or "Value",
            template="plotly_white",
            height=400,
        )
        return fig.to_dict()

    def _create_scatter_chart(
        self, labels: List[str], values: List[float], title: str, x_label: Optional[str], y_label: Optional[str]
    ) -> Dict[str, Any]:
        """Create a scatter chart."""
        fig = go.Figure(
            data=[
                go.Scatter(
                    x=labels,
                    y=values,
                    mode="markers",
                    marker=dict(size=10, color="rgb(55, 83, 109)"),
                )
            ]
        )
        fig.update_layout(
            title=title,
            xaxis_title=x_label or "X",
            yaxis_title=y_label or "Y",
            template="plotly_white",
            height=400,
        )
        return fig.to_dict()

    def _create_table_chart(
        self, labels: List[str], values: List[float], title: str
    ) -> Dict[str, Any]:
        """Create a table chart."""
        fig = go.Figure(
            data=[
                go.Table(
                    header=dict(
                        values=["Category", "Value"],
                        fill_color="rgb(55, 83, 109)",
                        font=dict(color="white", size=12),
                        align="left",
                    ),
                    cells=dict(
                        values=[labels, values],
                        fill_color="rgb(240, 240, 240)",
                        align="left",
                    ),
                )
            ]
        )
        fig.update_layout(
            title=title,
            template="plotly_white",
            height=400,
        )
        return fig.to_dict()

    def _create_empty_chart(self, title: str) -> Dict[str, Any]:
        """Create an empty chart placeholder."""
        fig = go.Figure()
        fig.add_annotation(
            text="No data available",
            xref="paper",
            yref="paper",
            x=0.5,
            y=0.5,
            showarrow=False,
        )
        fig.update_layout(
            title=title,
            template="plotly_white",
            height=400,
        )
        return {
            "type": "bar",
            "title": title,
            "data": json.dumps(fig.to_dict(), cls=PlotlyJSONEncoder),
            "config": {
                "displayModeBar": False,
                "responsive": True,
            },
        }

    def generate_charts_from_text(
        self, text: str, max_charts: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Automatically extract data and generate charts from text.

        Args:
            text: Text content to analyze
            max_charts: Maximum number of charts to generate

        Returns:
            List of chart dictionaries
        """
        charts = []

        try:
            # Extract data from text
            extracted_data = self.extract_data_from_text(text)

            # Generate charts based on extracted data
            if extracted_data.get("values") or extracted_data.get("percentages"):
                # Suggest chart type
                chart_type = self.suggest_chart_type(extracted_data, text)

                # Generate chart
                chart = self.generate_chart(
                    chart_type=chart_type,
                    data=extracted_data,
                    title="Data Overview",
                )

                if chart:
                    charts.append(chart)

                # Limit number of charts
                if len(charts) >= max_charts:
                    return charts

        except Exception as e:
            logger.error(f"Error generating charts from text: {e}")

        return charts


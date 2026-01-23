"""
📊 Performance Metrics Collection

Simple in-memory performance monitoring for API endpoints.
"""

import time
from collections import deque
from dataclasses import dataclass, field
from typing import Any, Dict

from loguru import logger


@dataclass
class EndpointMetrics:
    """Metrics for a single API endpoint."""
    
    endpoint: str
    method: str
    request_count: int = 0
    error_count: int = 0
    total_response_time: float = 0.0
    response_times: deque = field(default_factory=lambda: deque(maxlen=1000))  # Keep last 1000 requests
    
    @property
    def success_count(self) -> int:
        """Number of successful requests."""
        return self.request_count - self.error_count
    
    @property
    def error_rate(self) -> float:
        """Error rate as a percentage."""
        if self.request_count == 0:
            return 0.0
        return (self.error_count / self.request_count) * 100
    
    @property
    def avg_response_time(self) -> float:
        """Average response time in milliseconds."""
        if self.request_count == 0:
            return 0.0
        return (self.total_response_time / self.request_count) * 1000  # Convert to ms
    
    def get_percentile(self, percentile: float) -> float:
        """Get percentile response time (P50, P95, P99, etc.) in milliseconds."""
        if not self.response_times:
            return 0.0
        
        sorted_times = sorted(self.response_times)
        index = int(len(sorted_times) * percentile / 100)
        if index >= len(sorted_times):
            index = len(sorted_times) - 1
        return sorted_times[index] * 1000  # Convert to ms
    
    def record_request(self, response_time: float, is_error: bool = False) -> None:
        """Record a request with its response time."""
        self.request_count += 1
        self.total_response_time += response_time
        self.response_times.append(response_time)
        if is_error:
            self.error_count += 1
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert metrics to dictionary."""
        return {
            "endpoint": self.endpoint,
            "method": self.method,
            "request_count": self.request_count,
            "success_count": self.success_count,
            "error_count": self.error_count,
            "error_rate": round(self.error_rate, 2),
            "avg_response_time_ms": round(self.avg_response_time, 2),
            "p50_response_time_ms": round(self.get_percentile(50), 2),
            "p95_response_time_ms": round(self.get_percentile(95), 2),
            "p99_response_time_ms": round(self.get_percentile(99), 2),
            "min_response_time_ms": round(min(self.response_times) * 1000, 2) if self.response_times else 0.0,
            "max_response_time_ms": round(max(self.response_times) * 1000, 2) if self.response_times else 0.0,
        }


class MetricsCollector:
    """In-memory metrics collector for API performance monitoring."""
    
    def __init__(self):
        """Initialize the metrics collector."""
        self._endpoints: Dict[str, EndpointMetrics] = {}
        self._start_time = time.time()
        self._total_requests = 0
        self._total_errors = 0
    
    def _get_endpoint_key(self, method: str, path: str) -> str:
        """Generate a unique key for an endpoint."""
        # Normalize path (remove path parameters for grouping)
        # e.g., /api/v1/documents/123 -> /api/v1/documents/{id}
        normalized_path = path
        # Simple normalization: replace UUIDs and numbers with placeholders
        import re
        normalized_path = re.sub(r'/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', '/{id}', normalized_path, flags=re.IGNORECASE)
        normalized_path = re.sub(r'/\d+', '/{id}', normalized_path)
        return f"{method} {normalized_path}"
    
    def record_request(
        self,
        method: str,
        path: str,
        response_time: float,
        status_code: int,
    ) -> None:
        """Record a request with its metrics."""
        self._total_requests += 1
        is_error = status_code >= 400
        
        if is_error:
            self._total_errors += 1
        
        endpoint_key = self._get_endpoint_key(method, path)
        
        if endpoint_key not in self._endpoints:
            self._endpoints[endpoint_key] = EndpointMetrics(
                endpoint=path,
                method=method,
            )
        
        self._endpoints[endpoint_key].record_request(response_time, is_error)
        
        # Log slow requests (> 1 second)
        if response_time > 1.0:
            logger.warning(
                "Slow request detected",
                extra={
                    "method": method,
                    "path": path,
                    "response_time_ms": round(response_time * 1000, 2),
                    "status_code": status_code,
                },
            )
    
    def get_endpoint_metrics(self, endpoint_key: str = None) -> Dict[str, Any]:
        """Get metrics for a specific endpoint or all endpoints."""
        if endpoint_key:
            if endpoint_key in self._endpoints:
                return self._endpoints[endpoint_key].to_dict()
            return {}
        
        return {
            key: metrics.to_dict()
            for key, metrics in self._endpoints.items()
        }
    
    def get_summary(self) -> Dict[str, Any]:
        """Get overall performance summary."""
        uptime_seconds = time.time() - self._start_time
        uptime_hours = uptime_seconds / 3600
        
        # Calculate overall stats
        all_response_times = []
        for metrics in self._endpoints.values():
            all_response_times.extend(metrics.response_times)
        
        overall_avg = 0.0
        overall_p95 = 0.0
        overall_p99 = 0.0
        
        if all_response_times:
            sorted_times = sorted(all_response_times)
            overall_avg = (sum(sorted_times) / len(sorted_times)) * 1000
            p95_index = int(len(sorted_times) * 0.95)
            p99_index = int(len(sorted_times) * 0.99)
            if p95_index >= len(sorted_times):
                p95_index = len(sorted_times) - 1
            if p99_index >= len(sorted_times):
                p99_index = len(sorted_times) - 1
            overall_p95 = sorted_times[p95_index] * 1000
            overall_p99 = sorted_times[p99_index] * 1000
        
        overall_error_rate = 0.0
        if self._total_requests > 0:
            overall_error_rate = (self._total_errors / self._total_requests) * 100
        
        return {
            "uptime_seconds": round(uptime_seconds, 2),
            "uptime_hours": round(uptime_hours, 2),
            "total_requests": self._total_requests,
            "total_errors": self._total_errors,
            "overall_error_rate": round(overall_error_rate, 2),
            "requests_per_hour": round(self._total_requests / uptime_hours, 2) if uptime_hours > 0 else 0.0,
            "overall_avg_response_time_ms": round(overall_avg, 2),
            "overall_p95_response_time_ms": round(overall_p95, 2),
            "overall_p99_response_time_ms": round(overall_p99, 2),
            "endpoint_count": len(self._endpoints),
        }
    
    def reset(self) -> None:
        """Reset all metrics (useful for testing or periodic resets)."""
        self._endpoints.clear()
        self._start_time = time.time()
        self._total_requests = 0
        self._total_errors = 0
        logger.info("Metrics reset")


# Global metrics collector instance
metrics_collector = MetricsCollector()


#!/usr/bin/env python3
"""
🚀 Integration Tests Runner
Ottawa GenAI Research Assistant - Comprehensive Integration Test Suite

This script runs the complete integration test suite with proper
environment setup, service health checks, and detailed reporting.
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

import httpx
import pytest


class IntegrationTestRunner:
    """Comprehensive integration test runner."""
    
    def __init__(self):
        self.project_root = Path(__file__).parent.parent.parent
        self.test_dir = Path(__file__).parent
        self.results = {
            "start_time": None,
            "end_time": None,
            "duration": 0,
            "environment": {},
            "service_health": {},
            "test_results": {},
            "summary": {}
        }
    
    def check_environment(self) -> bool:
        """Check if the test environment is properly set up."""
        print("🔧 Checking test environment...")
        
        # Check Python version
        python_version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
        self.results["environment"]["python_version"] = python_version
        print(f"   ✓ Python version: {python_version}")
        
        # Check required packages
        required_packages = ["pytest", "httpx", "fastapi"]
        missing_packages = []
        
        for package in required_packages:
            try:
                __import__(package)
                print(f"   ✓ {package} is available")
            except ImportError:
                missing_packages.append(package)
                print(f"   ✗ {package} is missing")
        
        if missing_packages:
            print(f"\n❌ Missing required packages: {', '.join(missing_packages)}")
            print("   Install them with: pip install pytest httpx fastapi")
            return False
        
        # Check backend directory
        backend_dir = self.project_root / "backend"
        if not backend_dir.exists():
            print(f"   ✗ Backend directory not found: {backend_dir}")
            return False
        
        print(f"   ✓ Backend directory found: {backend_dir}")
        
        self.results["environment"]["status"] = "ready"
        return True
    
    async def check_services_health(self) -> bool:
        """Check if required services are healthy."""
        print("\n🏥 Checking service health...")
        
        services = {
            "backend": "http://localhost:8000/health",
            "frontend": "http://localhost:3000"
        }
        
        healthy_services = []
        
        async with httpx.AsyncClient(timeout=5.0) as client:
            for service_name, url in services.items():
                try:
                    response = await client.get(url)
                    if response.status_code == 200:
                        print(f"   ✓ {service_name} service is healthy")
                        healthy_services.append(service_name)
                        self.results["service_health"][service_name] = "healthy"
                    else:
                        print(f"   ⚠️  {service_name} service returned status {response.status_code}")
                        self.results["service_health"][service_name] = f"unhealthy ({response.status_code})"
                except Exception as e:
                    print(f"   ⚠️  {service_name} service is not accessible: {str(e)}")
                    self.results["service_health"][service_name] = f"unavailable ({str(e)})"
        
        # Backend is required for integration tests
        backend_healthy = "backend" in healthy_services
        if not backend_healthy:
            print("\n⚠️  Backend service is not healthy. Some tests may fail.")
            print("   Start the backend with: cd backend && python -m uvicorn app.main:app --reload")
        
        return len(healthy_services) > 0
    
    def run_test_category(self, category: str, markers: str = "") -> Dict[str, Any]:
        """Run a specific category of tests."""
        print(f"\n🧪 Running {category} tests...")
        
        # Build pytest command
        cmd_args = [
            "-v",
            "--tb=short",
            "--color=yes",
            f"--junitxml={self.test_dir}/reports/{category}_results.xml",
            f"{self.test_dir}/test_{category}_integration.py"
        ]
        
        if markers:
            cmd_args.extend(["-m", markers])
        
        # Run tests
        start_time = time.time()
        exit_code = pytest.main(cmd_args)
        duration = time.time() - start_time
        
        result = {
            "exit_code": exit_code,
            "duration": duration,
            "status": "passed" if exit_code == 0 else "failed"
        }
        
        print(f"   {category} tests completed in {duration:.2f}s - {result['status']}")
        return result
    
    def run_all_tests(self, categories: List[str] = None, skip_slow: bool = False) -> bool:
        """Run all integration tests."""
        print("🚀 Starting Ottawa GenAI Integration Tests")
        print("=" * 60)
        
        self.results["start_time"] = datetime.now().isoformat()
        start_time = time.time()
        
        # Default categories
        if categories is None:
            categories = ["api", "auth", "service", "workflow"]
        
        # Create reports directory
        reports_dir = self.test_dir / "reports"
        reports_dir.mkdir(exist_ok=True)
        
        # Run test categories
        all_passed = True
        for category in categories:
            markers = "not slow" if skip_slow else ""
            result = self.run_test_category(category, markers)
            self.results["test_results"][category] = result
            
            if result["status"] != "passed":
                all_passed = False
        
        # Calculate summary
        total_duration = time.time() - start_time
        self.results["end_time"] = datetime.now().isoformat()
        self.results["duration"] = total_duration
        
        passed_count = sum(1 for r in self.results["test_results"].values() if r["status"] == "passed")
        total_count = len(self.results["test_results"])
        
        self.results["summary"] = {
            "total_categories": total_count,
            "passed_categories": passed_count,
            "failed_categories": total_count - passed_count,
            "success_rate": (passed_count / total_count * 100) if total_count > 0 else 0,
            "overall_status": "passed" if all_passed else "failed"
        }
        
        return all_passed
    
    def generate_report(self) -> None:
        """Generate comprehensive test report."""
        print("\n📊 Generating test report...")
        
        # Save JSON report
        json_report_path = self.test_dir / "reports" / "integration_test_report.json"
        with open(json_report_path, "w") as f:
            json.dump(self.results, f, indent=2)
        
        print(f"   ✓ JSON report saved: {json_report_path}")
        
        # Generate summary report
        summary_report_path = self.test_dir / "reports" / "integration_test_summary.md"
        self._generate_markdown_report(summary_report_path)
        
        print(f"   ✓ Summary report saved: {summary_report_path}")
    
    def _generate_markdown_report(self, path: Path) -> None:
        """Generate markdown summary report."""
        summary = self.results["summary"]
        
        report_content = f"""# 🔗 Integration Test Report
Ottawa GenAI Research Assistant

**Generated:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}  
**Duration:** {self.results['duration']:.2f} seconds  
**Overall Status:** {'✅ PASSED' if summary['overall_status'] == 'passed' else '❌ FAILED'}

## 📈 Summary

| Metric | Value |
|--------|-------|
| Total Categories | {summary['total_categories']} |
| Passed Categories | {summary['passed_categories']} |
| Failed Categories | {summary['failed_categories']} |
| Success Rate | {summary['success_rate']:.1f}% |

## 🏥 Service Health

| Service | Status |
|---------|--------|
"""
        
        for service, status in self.results["service_health"].items():
            status_icon = "✅" if status == "healthy" else "⚠️"
            report_content += f"| {service.title()} | {status_icon} {status} |\n"
        
        report_content += "\n## 🧪 Test Results\n\n"
        
        for category, result in self.results["test_results"].items():
            status_icon = "✅" if result["status"] == "passed" else "❌"
            report_content += f"- **{category.title()} Integration Tests:** {status_icon} {result['status'].upper()} ({result['duration']:.2f}s)\n"
        
        report_content += f"""
## 🔧 Environment

- **Python Version:** {self.results['environment'].get('python_version', 'Unknown')}
- **Test Directory:** `{self.test_dir}`
- **Project Root:** `{self.project_root}`

## 📝 Notes

This report covers integration tests that verify:
- 🔗 API Integration: Frontend ↔ Backend communication
- 🔐 Authentication Integration: OAuth 2.0 and JWT flows
- 🔄 Service Integration: Cross-service interactions
- 🎯 Workflow Integration: End-to-end user journeys

For detailed test results, check the individual XML reports in the `reports/` directory.
"""
        
        with open(path, "w") as f:
            f.write(report_content)
    
    def print_summary(self) -> None:
        """Print test run summary."""
        summary = self.results["summary"]
        
        print("\n" + "=" * 60)
        print("🎯 INTEGRATION TEST SUMMARY")
        print("=" * 60)
        print(f"Overall Status: {'✅ PASSED' if summary['overall_status'] == 'passed' else '❌ FAILED'}")
        print(f"Total Duration: {self.results['duration']:.2f} seconds")
        print(f"Categories Passed: {summary['passed_categories']}/{summary['total_categories']}")
        print(f"Success Rate: {summary['success_rate']:.1f}%")
        
        if summary["overall_status"] != "passed":
            print("\n⚠️  Some tests failed. Check the detailed reports for more information.")
        else:
            print("\n🎉 All integration tests passed successfully!")


async def main():
    """Main entry point for integration test runner."""
    parser = argparse.ArgumentParser(
        description="Run Ottawa GenAI Research Assistant Integration Tests"
    )
    parser.add_argument(
        "--categories",
        nargs="+",
        choices=["api", "auth", "service", "workflow"],
        help="Test categories to run (default: all)"
    )
    parser.add_argument(
        "--skip-slow",
        action="store_true",
        help="Skip slow tests"
    )
    parser.add_argument(
        "--skip-health-check",
        action="store_true",
        help="Skip service health checks"
    )
    
    args = parser.parse_args()
    
    runner = IntegrationTestRunner()
    
    # Check environment
    if not runner.check_environment():
        sys.exit(1)
    
    # Check service health (optional)
    if not args.skip_health_check:
        await runner.check_services_health()
    
    # Run tests
    success = runner.run_all_tests(args.categories, args.skip_slow)
    
    # Generate reports
    runner.generate_report()
    runner.print_summary()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    import asyncio
    asyncio.run(main()) 
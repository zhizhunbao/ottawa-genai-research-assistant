#!/usr/bin/env python3
"""
Ottawa GenAI Research Assistant - Full Workflow Integration Tests

These tests verify the complete end-to-end workflows:
1. User registration and authentication
2. Document upload and processing
3. Chat interactions with uploaded documents
4. Report generation
5. Multi-language support
"""

import asyncio
import json
import os
import tempfile
from pathlib import Path
from typing import Dict, List, Optional

import pytest
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class IntegrationTestSuite:
    """Integration test suite for full workflow testing"""
    
    def __init__(self):
        self.backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        self.test_user_email = "test@integration.com"
        self.test_user_password = "TestPassword123!"
        self.auth_token: Optional[str] = None
        self.driver: Optional[webdriver.Chrome] = None
        
    def setup_webdriver(self):
        """Setup Chrome WebDriver for E2E testing"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.implicitly_wait(10)
        
    def teardown_webdriver(self):
        """Cleanup WebDriver"""
        if self.driver:
            self.driver.quit()
            
    def wait_for_backend(self, timeout: int = 30) -> bool:
        """Wait for backend to be available"""
        import time
        
        for _ in range(timeout):
            try:
                response = requests.get(f"{self.backend_url}/health")
                if response.status_code == 200:
                    return True
            except requests.exceptions.ConnectionError:
                pass
            time.sleep(1)
        return False
        
    def wait_for_frontend(self, timeout: int = 30) -> bool:
        """Wait for frontend to be available"""
        import time
        
        for _ in range(timeout):
            try:
                response = requests.get(self.frontend_url)
                if response.status_code == 200:
                    return True
            except requests.exceptions.ConnectionError:
                pass
            time.sleep(1)
        return False

    def test_user_registration_and_login(self) -> bool:
        """Test user registration and login workflow"""
        print("🔐 Testing user registration and login...")
        
        try:
            # Test registration via API
            registration_data = {
                "email": self.test_user_email,
                "password": self.test_user_password,
                "name": "Integration Test User"
            }
            
            response = requests.post(
                f"{self.backend_url}/api/auth/register",
                json=registration_data
            )
            
            if response.status_code not in [200, 201, 409]:  # 409 = user already exists
                print(f"❌ Registration failed: {response.status_code} - {response.text}")
                return False
            
            # Test login via API
            login_data = {
                "email": self.test_user_email,
                "password": self.test_user_password
            }
            
            response = requests.post(
                f"{self.backend_url}/api/auth/login",
                json=login_data
            )
            
            if response.status_code != 200:
                print(f"❌ Login failed: {response.status_code} - {response.text}")
                return False
            
            auth_response = response.json()
            self.auth_token = auth_response.get("access_token")
            
            if not self.auth_token:
                print("❌ No access token received")
                return False
            
            print("✅ User registration and login successful")
            return True
            
        except Exception as e:
            print(f"❌ Registration/login error: {e}")
            return False

    def test_document_upload_workflow(self) -> bool:
        """Test document upload and processing workflow"""
        print("📄 Testing document upload workflow...")
        
        if not self.auth_token:
            print("❌ No auth token available")
            return False
        
        try:
            # Create a test document
            test_content = """
            Ottawa Economic Development Strategy 2024
            
            The City of Ottawa is committed to fostering economic growth through:
            1. Innovation and technology sector development
            2. Small business support programs
            3. International trade promotion
            4. Sustainable development practices
            
            Key initiatives include:
            - Digital transformation support for local businesses
            - Green technology investment incentives
            - Startup incubator programs
            - Skills development partnerships with educational institutions
            """
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
                f.write(test_content)
                temp_file_path = f.name
            
            # Upload document via API
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            with open(temp_file_path, 'rb') as f:
                files = {"file": ("test_document.txt", f, "text/plain")}
                
                response = requests.post(
                    f"{self.backend_url}/api/documents/upload",
                    files=files,
                    headers=headers
                )
            
            # Cleanup temp file
            os.unlink(temp_file_path)
            
            if response.status_code not in [200, 201]:
                print(f"❌ Document upload failed: {response.status_code} - {response.text}")
                return False
            
            upload_response = response.json()
            document_id = upload_response.get("document_id")
            
            if not document_id:
                print("❌ No document ID received")
                return False
            
            # Wait for document processing
            import time
            for _ in range(30):  # Wait up to 30 seconds
                response = requests.get(
                    f"{self.backend_url}/api/documents/{document_id}",
                    headers=headers
                )
                
                if response.status_code == 200:
                    doc_data = response.json()
                    if doc_data.get("status") == "processed":
                        print("✅ Document upload and processing successful")
                        return True
                    elif doc_data.get("status") == "failed":
                        print("❌ Document processing failed")
                        return False
                
                time.sleep(1)
            
            print("❌ Document processing timeout")
            return False
            
        except Exception as e:
            print(f"❌ Document upload error: {e}")
            return False

    def test_chat_interaction_workflow(self) -> bool:
        """Test chat interaction with uploaded documents"""
        print("💬 Testing chat interaction workflow...")
        
        if not self.auth_token:
            print("❌ No auth token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Test chat query
            chat_data = {
                "message": "What are the key economic development initiatives mentioned in the documents?",
                "language": "en"
            }
            
            response = requests.post(
                f"{self.backend_url}/api/chat/message",
                json=chat_data,
                headers=headers
            )
            
            if response.status_code != 200:
                print(f"❌ Chat request failed: {response.status_code} - {response.text}")
                return False
            
            chat_response = response.json()
            
            # Verify response structure
            if not all(key in chat_response for key in ["response", "sources"]):
                print("❌ Invalid chat response structure")
                return False
            
            response_text = chat_response["response"]
            sources = chat_response["sources"]
            
            # Verify response contains relevant information
            if len(response_text) < 50:
                print("❌ Chat response too short")
                return False
            
            # Check for key terms that should be in the response
            key_terms = ["economic", "development", "innovation", "business"]
            found_terms = sum(1 for term in key_terms if term.lower() in response_text.lower())
            
            if found_terms < 2:
                print("❌ Chat response doesn't contain relevant information")
                return False
            
            print("✅ Chat interaction successful")
            return True
            
        except Exception as e:
            print(f"❌ Chat interaction error: {e}")
            return False

    def test_frontend_integration(self) -> bool:
        """Test frontend integration using Selenium"""
        print("🖥️ Testing frontend integration...")
        
        try:
            self.driver.get(self.frontend_url)
            
            # Wait for the app to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Check if login page is displayed
            page_source = self.driver.page_source
            
            # Basic checks for React app
            if "react" not in page_source.lower() and "root" not in page_source:
                print("❌ Frontend doesn't appear to be a React app")
                return False
            
            # Try to find common elements
            try:
                # Look for navigation or main content
                self.driver.find_element(By.TAG_NAME, "nav")
                print("✅ Navigation found")
            except:
                try:
                    self.driver.find_element(By.TAG_NAME, "main")
                    print("✅ Main content found")
                except:
                    print("⚠️ No standard navigation or main elements found")
            
            print("✅ Frontend integration test passed")
            return True
            
        except Exception as e:
            print(f"❌ Frontend integration error: {e}")
            return False

    def test_multilingual_support(self) -> bool:
        """Test multilingual support"""
        print("🌐 Testing multilingual support...")
        
        if not self.auth_token:
            print("❌ No auth token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Test French chat query
            chat_data = {
                "message": "Quelles sont les principales initiatives de développement économique?",
                "language": "fr"
            }
            
            response = requests.post(
                f"{self.backend_url}/api/chat/message",
                json=chat_data,
                headers=headers
            )
            
            if response.status_code != 200:
                print(f"❌ French chat request failed: {response.status_code}")
                return False
            
            chat_response = response.json()
            response_text = chat_response.get("response", "")
            
            if len(response_text) < 20:
                print("❌ French response too short")
                return False
            
            print("✅ Multilingual support test passed")
            return True
            
        except Exception as e:
            print(f"❌ Multilingual support error: {e}")
            return False

    def run_all_tests(self) -> bool:
        """Run all integration tests"""
        print("🚀 Starting Integration Test Suite")
        print("=" * 60)
        
        # Check if services are available
        print("⏳ Waiting for services to be available...")
        
        if not self.wait_for_backend():
            print("❌ Backend not available")
            return False
        print("✅ Backend is available")
        
        if not self.wait_for_frontend():
            print("❌ Frontend not available")
            return False
        print("✅ Frontend is available")
        
        # Setup WebDriver
        self.setup_webdriver()
        
        try:
            # Run test sequence
            tests = [
                ("User Registration & Login", self.test_user_registration_and_login),
                ("Document Upload Workflow", self.test_document_upload_workflow),
                ("Chat Interaction Workflow", self.test_chat_interaction_workflow),
                ("Frontend Integration", self.test_frontend_integration),
                ("Multilingual Support", self.test_multilingual_support),
            ]
            
            results = []
            for test_name, test_func in tests:
                print(f"\n{'='*50}")
                print(f"Running: {test_name}")
                print('='*50)
                
                result = test_func()
                results.append((test_name, result))
                
                if result:
                    print(f"✅ {test_name} - PASSED")
                else:
                    print(f"❌ {test_name} - FAILED")
            
            # Summary
            print(f"\n{'='*60}")
            print("INTEGRATION TEST RESULTS")
            print('='*60)
            
            passed = sum(1 for _, result in results if result)
            total = len(results)
            
            for test_name, result in results:
                status = "✅ PASSED" if result else "❌ FAILED"
                print(f"{test_name:<30} {status}")
            
            print(f"\nSummary: {passed}/{total} tests passed")
            
            if passed == total:
                print("🎉 All integration tests passed!")
                return True
            else:
                print("❌ Some integration tests failed!")
                return False
                
        finally:
            self.teardown_webdriver()


def main():
    """Main function for running integration tests"""
    import sys
    
    test_suite = IntegrationTestSuite()
    success = test_suite.run_all_tests()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main() 
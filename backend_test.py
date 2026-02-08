import requests
import sys
import json
import io
from datetime import datetime

class EduQGAPITester:
    def __init__(self, base_url="https://brainnotes-5.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        
        # Default headers
        req_headers = {'Content-Type': 'application/json'}
        if self.token:
            req_headers['Authorization'] = f'Bearer {self.token}'
        
        # Override with custom headers
        if headers:
            req_headers.update(headers)
        
        # Remove Content-Type for file uploads
        if files:
            req_headers.pop('Content-Type', None)

        try:
            if method == 'GET':
                response = requests.get(url, headers=req_headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, headers=req_headers)
                else:
                    response = requests.post(url, json=data, headers=req_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=req_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=req_headers)

            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json() if response.content else {}
                except:
                    response_data = {}
                self.log_test(name, True, f"Status: {response.status_code}")
                return True, response_data
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json().get('detail', '')
                    if error_detail:
                        error_msg += f" - {error_detail}"
                except:
                    pass
                self.log_test(name, False, error_msg)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": test_email,
                "password": "TestPass123!",
                "name": "Test User"
            }
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        # First register a user
        test_email = f"login_test_{datetime.now().strftime('%H%M%S')}@example.com"
        reg_success, reg_response = self.run_test(
            "Registration for Login Test",
            "POST",
            "auth/register",
            200,
            data={
                "email": test_email,
                "password": "TestPass123!",
                "name": "Login Test User"
            }
        )
        
        if not reg_success:
            return False
        
        # Now test login
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": test_email,
                "password": "TestPass123!"
            }
        )
        
        return success and 'token' in response

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        success, response = self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={
                "email": "nonexistent@example.com",
                "password": "wrongpassword"
            }
        )
        return success

    def test_ebook_upload(self):
        """Test e-book upload functionality"""
        if not self.token:
            self.log_test("E-book Upload", False, "No authentication token")
            return False, None
        
        # Create a sample text file
        sample_content = """
        This is a sample educational text for testing the question generation system.
        
        Chapter 1: Introduction to Computer Science
        Computer science is the study of computational systems and the design of computer systems and their applications.
        It involves the study of algorithms, data structures, and the design and analysis of computational systems.
        
        Key concepts include:
        1. Programming languages and software development
        2. Data structures and algorithms
        3. Computer systems and architecture
        4. Database systems and data management
        5. Artificial intelligence and machine learning
        
        Chapter 2: Programming Fundamentals
        Programming is the process of creating instructions for computers to execute.
        Variables are used to store data, and functions are used to organize code into reusable blocks.
        Control structures like loops and conditionals control the flow of program execution.
        """
        
        # Create file-like object
        file_content = sample_content.encode('utf-8')
        files = {
            'file': ('sample_textbook.txt', io.BytesIO(file_content), 'text/plain')
        }
        
        success, response = self.run_test(
            "E-book Upload (TXT)",
            "POST",
            "ebooks/upload",
            200,
            files=files
        )
        
        if success and 'id' in response:
            return True, response['id']
        return False, None

    def test_get_ebooks(self):
        """Test retrieving user's e-books"""
        if not self.token:
            self.log_test("Get E-books", False, "No authentication token")
            return False
        
        success, response = self.run_test(
            "Get E-books",
            "GET",
            "ebooks",
            200
        )
        
        return success

    def test_question_generation(self, ebook_id):
        """Test AI question generation"""
        if not self.token or not ebook_id:
            self.log_test("Question Generation", False, "Missing token or ebook_id")
            return False, []
        
        success, response = self.run_test(
            "Question Generation",
            "POST",
            "questions/generate",
            200,
            data={
                "ebook_id": ebook_id,
                "question_types": ["MCQ", "Short Answer"],
                "difficulty": "medium",
                "num_questions": 3
            }
        )
        
        if success and isinstance(response, list):
            return True, response
        return False, []

    def test_get_questions(self):
        """Test retrieving generated questions"""
        if not self.token:
            self.log_test("Get Questions", False, "No authentication token")
            return False
        
        success, response = self.run_test(
            "Get Questions",
            "GET",
            "questions",
            200
        )
        
        return success

    def test_assignment_generation(self, question_ids):
        """Test PDF assignment generation"""
        if not self.token or not question_ids:
            self.log_test("Assignment Generation", False, "Missing token or question_ids")
            return False
        
        # Use requests directly for PDF response
        url = f"{self.api_url}/assignments/generate"
        headers = {'Authorization': f'Bearer {self.token}'}
        
        data = {
            "question_ids": question_ids,
            "student_name": "Test Student",
            "roll_number": "TS001",
            "subject": "Computer Science",
            "handwriting_style": "neat",
            "pen_color": "blue"
        }
        
        try:
            response = requests.post(url, json=data, headers=headers)
            success = response.status_code == 200
            
            if success:
                # Check if response is PDF
                content_type = response.headers.get('content-type', '')
                is_pdf = 'application/pdf' in content_type
                self.log_test("Assignment Generation", success, f"PDF generated: {is_pdf}")
                return success
            else:
                self.log_test("Assignment Generation", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Assignment Generation", False, f"Exception: {str(e)}")
            return False

    def test_unauthorized_access(self):
        """Test accessing protected endpoints without token"""
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Unauthorized Access Test",
            "GET",
            "ebooks",
            401
        )
        
        # Restore token
        self.token = original_token
        return success

    def run_all_tests(self):
        """Run comprehensive API test suite"""
        print("🚀 Starting EduQG AI Backend API Tests")
        print("=" * 50)
        
        # Test basic connectivity
        if not self.test_root_endpoint():
            print("❌ Root endpoint failed - stopping tests")
            return self.get_summary()
        
        # Test authentication
        if not self.test_user_registration():
            print("❌ User registration failed - stopping tests")
            return self.get_summary()
        
        self.test_user_login()
        self.test_invalid_login()
        self.test_unauthorized_access()
        
        # Test e-book functionality
        upload_success, ebook_id = self.test_ebook_upload()
        self.test_get_ebooks()
        
        # Test question generation (requires successful upload)
        question_ids = []
        if upload_success and ebook_id:
            gen_success, questions = self.test_question_generation(ebook_id)
            if gen_success and questions:
                question_ids = [q['id'] for q in questions]
        
        self.test_get_questions()
        
        # Test assignment generation (requires questions)
        if question_ids:
            self.test_assignment_generation(question_ids)
        
        return self.get_summary()

    def get_summary(self):
        """Get test summary"""
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed")
            failed_tests = [r for r in self.test_results if not r['success']]
            print("\nFailed Tests:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
            return 1

def main():
    tester = EduQGAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
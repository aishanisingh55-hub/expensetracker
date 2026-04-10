        // Check if already logged in
        window.onload = function() {
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                window.location.href = 'extracker.html';
            }
            loadTheme();
        };

        function toggleTheme() {
            const body = document.body;
            const themeToggle = document.getElementById('themeToggle');
            
            if (body.classList.contains('dark-mode')) {
                body.classList.remove('dark-mode');
                themeToggle.textContent = '☀️';
                localStorage.setItem('loginTheme', 'light');
            } else {
                body.classList.add('dark-mode');
                themeToggle.textContent = '🌙';
                localStorage.setItem('loginTheme', 'dark');
            }
        }

        function loadTheme() {
            const savedTheme = localStorage.getItem('loginTheme');
            const body = document.body;
            const themeToggle = document.getElementById('themeToggle');
            
            if (savedTheme === 'dark') {
                body.classList.add('dark-mode');
                themeToggle.textContent = '🌙';
            } else {
                body.classList.remove('dark-mode');
                themeToggle.textContent = '☀️';
            }
        }

        function togglePassword(inputId, icon) {
            const input = document.getElementById(inputId);
            const svg = icon.querySelector('svg');
            
            if (input.type === 'password') {
                // Show password
                input.type = 'text';
                svg.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
            } else {
                // Hide password
                input.type = 'password';
                svg.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
            }
        }

        function showPassword(inputId) {
            const input = document.getElementById(inputId);
            input.type = 'text';
        }

        function hidePassword(inputId) {
            const input = document.getElementById(inputId);
            input.type = 'password';
        }

        function checkCapsLock(event, warningId) {
            const warning = document.getElementById(warningId);
            if (event.getModifierState && event.getModifierState('CapsLock')) {
                warning.style.display = 'block';
            } else {
                warning.style.display = 'none';
            }
        }

        function toggleForm() {
            const loginForm = document.getElementById('loginForm');
            const signupForm = document.getElementById('signupForm');
            const formTitle = document.getElementById('formTitle');
            
            hideMessages();
            
            if (loginForm.style.display === 'none') {
                loginForm.style.display = 'block';
                signupForm.style.display = 'none';
                formTitle.textContent = 'Welcome Back!';
                clearInputs();
            } else {
                loginForm.style.display = 'none';
                signupForm.style.display = 'block';
                formTitle.textContent = 'Create Account';
                clearInputs();
            }
        }

        function clearInputs() {
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginPassword').value = '';
            document.getElementById('signupUsername').value = '';
            document.getElementById('signupPassword').value = '';
            document.getElementById('signupConfirmPassword').value = '';
        }

        function showError(message) {
            const errorMsg = document.getElementById('errorMsg');
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
            setTimeout(() => errorMsg.style.display = 'none', 3000);
        }

        function showSuccess(message) {
            const successMsg = document.getElementById('successMsg');
            successMsg.textContent = message;
            successMsg.style.display = 'block';
            setTimeout(() => successMsg.style.display = 'none', 3000);
        }

        function hideMessages() {
            document.getElementById('errorMsg').style.display = 'none';
            document.getElementById('successMsg').style.display = 'none';
        }

        function handleSignup() {
            const username = document.getElementById('signupUsername').value.trim();
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;

            if (!username || !password || !confirmPassword) {
                showError('Please fill in all fields');
                return;
            }

            if (username.length < 3) {
                showError('Username must be at least 3 characters');
                return;
            }

            if (password !== confirmPassword) {
                showError('Passwords do not match');
                return;
            }

            if (password.length < 4) {
                showError('Password must be at least 4 characters');
                return;
            }

            const users = JSON.parse(localStorage.getItem('expenseTrackerUsers') || '{}');
            
            if (users[username]) {
                showError('Username already exists');
                return;
            }

            users[username] = { password: password };
            localStorage.setItem('expenseTrackerUsers', JSON.stringify(users));

            showSuccess('Account created successfully! Please login.');
            setTimeout(() => {
                toggleForm();
                document.getElementById('loginUsername').value = username;
            }, 1500);
        }

        function handleLogin() {
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;

            if (!username || !password) {
                showError('Please enter username and password');
                return;
            }

            const users = JSON.parse(localStorage.getItem('expenseTrackerUsers') || '{}');
            
            if (!users[username]) {
                showError('User not found. Please sign up first.');
                return;
            }

            if (users[username].password !== password) {
                showError('Incorrect password');
                return;
            }

            localStorage.setItem('currentUser', username);
            showSuccess('Login successful! Redirecting...');
            
            setTimeout(() => {
                window.location.href = 'extracker.html';
            }, 1000);
        }

        // Enter key support
        document.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const loginForm = document.getElementById('loginForm');
                if (loginForm.style.display !== 'none') {
                    handleLogin();
                } else {
                    handleSignup();
                }
            }
        });

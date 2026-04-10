        let expenses = [];
        let budget = 0;
        let pieChart, lineChart, barChart;
        let selectedMonths = [];
        let maxFilterAmount = 0;

        const categoryColors = {
            Food: '#FF6384',
            Transport: '#36A2EB',
            Shopping: '#FFCE56',
            Bills: '#4BC0C0',
            Entertainment: '#9966FF',
            Health: '#FF9F40',
            Education: '#FF6384',
            Other: '#C9CBCF'
        };

        const categoryIcons = {
            Food: '🍔',
            Transport: '🚗',
            Shopping: '🛍️',
            Bills: '💡',
            Entertainment: '🎮',
            Health: '🏥',
            Education: '📚',
            Other: '📦'
        };

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];

        window.onload = function() {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('expenseDate').setAttribute('max', today);
            initializeMonthCheckboxes();
            loadTheme();
        };

        function toggleTheme() {
            console.log('Toggle theme clicked!'); // Debug
            const body = document.body;
            const themeToggle = document.getElementById('themeToggle');
            
            if (body.classList.contains('dark-mode')) {
                body.classList.remove('dark-mode');
                themeToggle.textContent = '☀️';
                localStorage.setItem('theme', 'light');
                console.log('Switched to light mode');
            } else {
                body.classList.add('dark-mode');
                themeToggle.textContent = '🌙';
                localStorage.setItem('theme', 'dark');
                console.log('Switched to dark mode');
            }
        }

        function loadTheme() {
            const savedTheme = localStorage.getItem('theme');
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

        function handleLogout() {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('currentUser');
                window.location.href = 'loginpage.html';
            }
        }

        function showTab(tabName) {
            const tabs = document.querySelectorAll('.tab');
            const contents = document.querySelectorAll('.content');
            
            tabs.forEach(tab => tab.classList.remove('active'));
            contents.forEach(content => content.classList.remove('active'));
            
            // Find and activate the clicked tab
            tabs.forEach(tab => {
                if (tab.getAttribute('data-tab') === tabName) {
                    tab.classList.add('active');
                }
            });
            
            document.getElementById(tabName).classList.add('active');

            if (tabName === 'analytics') {
                setTimeout(() => updateCharts(), 100);
            } else if (tabName === 'summary') {
                updateMonthlySummary();
            }
        }

        function formatDateToDisplay(dateStr) {
            const [year, month, day] = dateStr.split('-');
            return day + '/' + month + '/' + year;
        }

        document.getElementById('expenseDate').addEventListener('change', function(e) {
            const displayDiv = document.getElementById('dateDisplay');
            if (e.target.value) {
                displayDiv.textContent = 'Selected: ' + formatDateToDisplay(e.target.value);
            } else {
                displayDiv.textContent = '';
            }
        });

        function addExpense() {
            const name = document.getElementById('expenseName').value;
            const category = document.getElementById('expenseCategory').value;
            const amount = parseFloat(document.getElementById('expenseAmount').value);
            const date = document.getElementById('expenseDate').value;
            const description = document.getElementById('expenseDescription').value;

            if (!name || !amount || !date) {
                alert('Please fill in all required fields!');
                return;
            }

            const expense = {
                id: Date.now(),
                name,
                category,
                amount,
                date,
                displayDate: formatDateToDisplay(date),
                description
            };

            expenses.push(expense);
            
            document.getElementById('expenseName').value = '';
            document.getElementById('expenseAmount').value = '';
            document.getElementById('expenseDate').value = '';
            document.getElementById('expenseDescription').value = '';
            document.getElementById('dateDisplay').textContent = '';

            updateTransactions();
            updateBudget();
            updateFilters();
            alert('Expense added successfully!');
        }

        function deleteExpense(id) {
            if (confirm('Are you sure you want to delete this expense?')) {
                expenses = expenses.filter(exp => exp.id !== id);
                updateTransactions();
                updateBudget();
                updateCharts();
                updateFilters();
            }
        }

        function initializeMonthCheckboxes() {
            const container = document.getElementById('monthCheckboxes');
            let html = '';
            monthNames.forEach((month, index) => {
                html += '<div class="month-checkbox-item">' +
                    '<input type="checkbox" id="month' + index + '" value="' + index + '" onchange="applyFilters()">' +
                    '<label for="month' + index + '">' + month + '</label>' +
                    '</div>';
            });
            container.innerHTML = html;
        }

        function updateFilters() {
            if (expenses.length === 0) {
                document.getElementById('amountSlider').max = 0;
                document.getElementById('sliderMax').textContent = 'Rs.0';
                document.getElementById('maxAmount').textContent = '0';
                maxFilterAmount = 0;
                return;
            }

            const maxExpense = Math.max(...expenses.map(exp => exp.amount));
            const roundedMax = Math.ceil(maxExpense / 10000) * 10000;
            maxFilterAmount = roundedMax || 10000;

            document.getElementById('amountSlider').max = roundedMax;
            document.getElementById('amountSlider').value = roundedMax;
            document.getElementById('sliderMax').textContent = 'Rs.' + roundedMax;
            document.getElementById('maxAmount').textContent = roundedMax;
        }

        function applyFilters() {
            const maxAmount = parseFloat(document.getElementById('amountSlider').value);
            document.getElementById('maxAmount').textContent = maxAmount.toFixed(0);

            selectedMonths = [];
            monthNames.forEach((month, index) => {
                const checkbox = document.getElementById('month' + index);
                if (checkbox && checkbox.checked) {
                    selectedMonths.push(index);
                }
            });

            let filteredExpenses = expenses.filter(exp => exp.amount <= maxAmount);

            if (selectedMonths.length > 0) {
                filteredExpenses = filteredExpenses.filter(exp => {
                    const expDate = new Date(exp.date);
                    return selectedMonths.includes(expDate.getMonth());
                });
            }

            displayFilteredTransactions(filteredExpenses);
        }

        function resetFilters() {
            document.getElementById('amountSlider').value = maxFilterAmount;
            document.getElementById('maxAmount').textContent = maxFilterAmount.toFixed(0);

            monthNames.forEach((month, index) => {
                const checkbox = document.getElementById('month' + index);
                if (checkbox) checkbox.checked = false;
            });

            selectedMonths = [];
            updateTransactions();
        }

        document.addEventListener('DOMContentLoaded', function() {
            const slider = document.getElementById('amountSlider');
            if (slider) {
                slider.addEventListener('input', applyFilters);
            }
        });

        function displayFilteredTransactions(filteredExpenses) {
            const list = document.getElementById('transactionList');
            
            if (filteredExpenses.length === 0) {
                list.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No transactions match the selected filters.</p>';
                return;
            }

            const sortedExpenses = [...filteredExpenses].sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA;
            });

            list.innerHTML = sortedExpenses.map(exp => '<div class="transaction-item">' +
                '<div class="transaction-info">' +
                '<h3>' + exp.name + '</h3>' +
                '<span class="category">' + categoryIcons[exp.category] + ' ' + exp.category + '</span>' +
                '<p style="margin: 5px 0; color: #666;">' + exp.description + '</p>' +
                '<p class="date">📅 ' + exp.displayDate + '</p>' +
                '</div>' +
                '<div style="display: flex; align-items: center;">' +
                '<div class="transaction-amount">Rs.' + (Math.round(exp.amount * 100) / 100).toFixed(2) + '</div>' +
                '<button class="delete-btn" onclick="deleteExpense(' + exp.id + ')">Delete</button>' +
                '</div>' +
                '</div>').join('');
        }

        function searchExpenses() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            
            if (searchTerm === '') {
                updateTransactions();
                return;
            }

            const filteredExpenses = expenses.filter(exp => 
                exp.name.toLowerCase().includes(searchTerm) || 
                exp.description.toLowerCase().includes(searchTerm)
            );

            displayFilteredTransactions(filteredExpenses);
        }

        function downloadPDF() {
            try {
                const { jsPDF } = window.jspdf;
                
                if (!jsPDF) {
                    alert('PDF library not loaded. Downloading as text file instead.');
                    downloadAsText();
                    return;
                }
                
                const doc = new jsPDF();
                
                // Title
                doc.setFontSize(20);
                doc.setTextColor(102, 126, 234);
                doc.text('EXPENSE TRACKER REPORT', 105, 20, { align: 'center' });
                
                // Date
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text('Generated: ' + new Date().toLocaleString(), 105, 28, { align: 'center' });
                
                // Summary Section
                doc.setFontSize(14);
                doc.setTextColor(0, 0, 0);
                doc.text('SUMMARY', 20, 40);
                
                doc.setFontSize(11);
                const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
                doc.text('Total Expenses: Rs. ' + total.toFixed(2), 20, 48);
                doc.text('Total Transactions: ' + expenses.length, 20, 55);
                
                // Transactions Section
                doc.setFontSize(14);
                doc.text('TRANSACTIONS', 20, 70);
                
                const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
                
                let yPos = 80;
                doc.setFontSize(9);
                
                sortedExpenses.forEach((exp, index) => {
                    if (yPos > 270) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    doc.setTextColor(102, 126, 234);
                    doc.text((index + 1) + '. ' + exp.name, 20, yPos);
                    
                    doc.setTextColor(0, 0, 0);
                    yPos += 5;
                    doc.text('   Category: ' + categoryIcons[exp.category] + ' ' + exp.category, 20, yPos);
                    yPos += 5;
                    doc.text('   Amount: Rs. ' + exp.amount.toFixed(2), 20, yPos);
                    yPos += 5;
                    doc.text('   Date: ' + exp.displayDate, 20, yPos);
                    yPos += 5;
                    doc.text('   Description: ' + (exp.description || 'N/A'), 20, yPos);
                    yPos += 8;
                });
                
                // Save PDF
                doc.save('Expense_Report_' + new Date().toISOString().split('T')[0] + '.pdf');
                alert('PDF Report downloaded successfully!');
            } catch (error) {
                console.error('PDF Error:', error);
                alert('Error generating PDF. Downloading as text file instead.');
                downloadAsText();
            }
        }

        function downloadAsText() {
            let reportContent = '=== EXPENSE TRACKER REPORT ===\n\n';
            reportContent += 'Generated: ' + new Date().toLocaleString() + '\n\n';
            reportContent += 'SUMMARY\n';
            reportContent += '------------------------\n';
            reportContent += 'Total Expenses: Rs.' + expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2) + '\n';
            reportContent += 'Total Transactions: ' + expenses.length + '\n\n';
            reportContent += 'TRANSACTIONS\n';
            reportContent += '------------------------\n\n';

            const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            sortedExpenses.forEach(exp => {
                reportContent += 'Name: ' + exp.name + '\n';
                reportContent += 'Category: ' + categoryIcons[exp.category] + ' ' + exp.category + '\n';
                reportContent += 'Amount: Rs.' + exp.amount.toFixed(2) + '\n';
                reportContent += 'Date: ' + exp.displayDate + '\n';
                reportContent += 'Description: ' + exp.description + '\n';
                reportContent += '------------------------\n';
            });

            const blob = new Blob([reportContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Expense_Report_' + new Date().toISOString().split('T')[0] + '.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }

        function updateTransactions() {
            const list = document.getElementById('transactionList');
            const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
            document.getElementById('totalExpense').textContent = Math.round(total * 100) / 100;

            if (expenses.length === 0) {
                list.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No transactions yet. Add your first expense!</p>';
                return;
            }

            const sortedExpenses = [...expenses].sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA;
            });

            list.innerHTML = sortedExpenses.map(exp => '<div class="transaction-item">' +
                '<div class="transaction-info">' +
                '<h3>' + exp.name + '</h3>' +
                '<span class="category">' + categoryIcons[exp.category] + ' ' + exp.category + '</span>' +
                '<p style="margin: 5px 0; color: #666;">' + exp.description + '</p>' +
                '<p class="date">📅 ' + exp.displayDate + '</p>' +
                '</div>' +
                '<div style="display: flex; align-items: center;">' +
                '<div class="transaction-amount">Rs.' + (Math.round(exp.amount * 100) / 100).toFixed(2) + '</div>' +
                '<button class="delete-btn" onclick="deleteExpense(' + exp.id + ')">Delete</button>' +
                '</div>' +
                '</div>').join('');
        }

        function updateCharts() {
            const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];
            const categoryData = categories.map(cat => ({
                name: cat,
                value: expenses.filter(exp => exp.category === cat).reduce((sum, exp) => sum + exp.amount, 0)
            })).filter(item => item.value > 0);

            const pieCtx = document.getElementById('pieChart');
            if (pieCtx) {
                const ctx = pieCtx.getContext('2d');
                if (pieChart) pieChart.destroy();
                pieChart = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: categoryData.map(d => d.name),
                        datasets: [{
                            data: categoryData.map(d => d.value),
                            backgroundColor: categoryData.map(d => categoryColors[d.name])
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.label + ': Rs.' + context.parsed.toFixed(2);
                                    }
                                }
                            }
                        }
                    }
                });
            }

            const monthlyData = {};
            expenses.forEach(exp => {
                const expDate = new Date(exp.date);
                const monthYear = expDate.toLocaleString('default', { month: 'short', year: 'numeric' });
                const sortKey = expDate.getFullYear() + '-' + String(expDate.getMonth() + 1).padStart(2, '0');
                
                if (!monthlyData[sortKey]) {
                    monthlyData[sortKey] = {
                        label: monthYear,
                        amount: 0
                    };
                }
                monthlyData[sortKey].amount += exp.amount;
            });

            const sortedMonthlyData = Object.keys(monthlyData)
                .sort()
                .map(key => ({
                    month: monthlyData[key].label,
                    amount: monthlyData[key].amount
                }));

            const lineCtx = document.getElementById('lineChart');
            if (lineCtx) {
                const ctx = lineCtx.getContext('2d');
                if (lineChart) lineChart.destroy();
                lineChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: sortedMonthlyData.map(d => d.month),
                        datasets: [{
                            label: 'Monthly Expenses (Rs.)',
                            data: sortedMonthlyData.map(d => d.amount),
                            borderColor: '#667eea',
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: '#667eea',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 5,
                            pointHoverRadius: 7
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return 'Expenses: Rs.' + context.parsed.y.toFixed(2);
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return 'Rs.' + value.toFixed(0);
                                    }
                                }
                            }
                        }
                    }
                });
            }

            const barCtx = document.getElementById('barChart');
            if (barCtx) {
                const ctx = barCtx.getContext('2d');
                if (barChart) barChart.destroy();
                barChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: categoryData.map(d => d.name),
                        datasets: [{
                            label: 'Amount (Rs.)',
                            data: categoryData.map(d => d.value),
                            backgroundColor: categoryData.map(d => categoryColors[d.name])
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.label + ': Rs.' + context.parsed.y.toFixed(2);
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return 'Rs.' + value.toFixed(0);
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }

        function updateBudget() {
            budget = parseFloat(document.getElementById('budgetAmount').value) || 0;
            const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
            const remaining = budget - total;
            const percentage = budget > 0 ? (total / budget) * 100 : 0;

            const display = document.getElementById('budgetDisplay');
            
            if (budget === 0) {
                display.innerHTML = '';
                return;
            }

            let progressColor = '#4CAF50';
            if (percentage > 100) progressColor = '#f44336';
            else if (percentage > 80) progressColor = '#FFC107';

            let warningHtml = '';
            if (total > budget) {
                warningHtml = '<div class="warning"><strong>Warning:</strong> You have exceeded your budget by Rs.' + (Math.round((total - budget) * 100) / 100).toFixed(2) + '</div>';
            }

            display.innerHTML = '<div class="budget-display">' +
                '<div class="budget-item">' +
                '<span>Budget Limit</span>' +
                '<span>Rs.' + (Math.round(budget * 100) / 100).toFixed(2) + '</span>' +
                '</div>' +
                '<div class="budget-item">' +
                '<span>Total Spent</span>' +
                '<span>Rs.' + (Math.round(total * 100) / 100).toFixed(2) + '</span>' +
                '</div>' +
                '<div class="budget-item">' +
                '<span>Remaining</span>' +
                '<span>Rs.' + (Math.round(remaining * 100) / 100).toFixed(2) + '</span>' +
                '</div>' +
                '<div class="progress-bar">' +
                '<div class="progress-fill" style="width: ' + Math.min(percentage, 100) + '%; background: ' + progressColor + '"></div>' +
                '</div>' +
                '<p style="text-align: center; margin-top: 15px; font-size: 14px;">' + percentage.toFixed(1) + '% of budget used</p>' +
                warningHtml +
                '</div>';
        }

        function updateMonthlySummary() {
            const now = new Date();
            const currentMonthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
            document.getElementById('currentMonth').textContent = currentMonthName;

            const currentMonthExpenses = expenses.filter(exp => {
                const expDate = new Date(exp.date);
                return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
            });

            const monthlyTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            const dailyAvg = currentMonthExpenses.length > 0 ? monthlyTotal / now.getDate() : 0;

            document.getElementById('monthlyTotal').textContent = (Math.round(monthlyTotal * 100) / 100).toFixed(2);
            document.getElementById('monthlyCount').textContent = currentMonthExpenses.length;
            document.getElementById('dailyAvg').textContent = (Math.round(dailyAvg * 100) / 100).toFixed(2);

            const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];
            const breakdown = document.getElementById('categoryBreakdown');
            
            let html = '<h3 style="margin-bottom: 20px;">Category Breakdown</h3>';
            
            let hasCategories = false;
            categories.forEach(cat => {
                const catTotal = currentMonthExpenses
                    .filter(exp => exp.category === cat)
                    .reduce((sum, exp) => sum + exp.amount, 0);
                const percentage = monthlyTotal > 0 ? (catTotal / monthlyTotal) * 100 : 0;
                
                if (catTotal > 0) {
                    hasCategories = true;
                    html += '<div class="category-item">' +
                        '<div class="category-header">' +
                        '<span>' + categoryIcons[cat] + ' ' + cat + '</span>' +
                        '<span>Rs.' + (Math.round(catTotal * 100) / 100).toFixed(2) + ' (' + percentage.toFixed(1) + '%)</span>' +
                        '</div>' +
                        '<div class="category-bar">' +
                        '<div class="category-bar-fill" style="width: ' + percentage + '%; background: ' + categoryColors[cat] + '"></div>' +
                        '</div>' +
                        '</div>';
                }
            });
            
            if (!hasCategories) {
                html += '<p style="text-align: center; color: #666; padding: 20px;">No expenses this month yet.</p>';
            }
            
            breakdown.innerHTML = html;
        }

        updateTransactions();

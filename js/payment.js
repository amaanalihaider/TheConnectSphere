document.addEventListener('DOMContentLoaded', function() {
    console.log('Payment page initialized');
    
    // Initialize AOS animations
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });
    
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Get plan details from session storage
    const selectedPlan = sessionStorage.getItem('selectedPlan') || 'pro';
    const selectedPrice = sessionStorage.getItem('selectedPrice') || '19';
    
    // Update plan details in the UI
    const planNameElement = document.getElementById('plan-name');
    const planPriceElement = document.getElementById('plan-price');
    
    if (planNameElement && planPriceElement) {
        planNameElement.textContent = `${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan`;
        planPriceElement.textContent = `$${selectedPrice}/month`;
    }
    
    // Payment Strategy Pattern Implementation
    
    // Payment Strategy Interface (abstract)
    class PaymentStrategy {
        constructor() {
            if (this.constructor === PaymentStrategy) {
                throw new Error("Abstract class 'PaymentStrategy' cannot be instantiated.");
            }
        }
        
        processPayment(amount) {
            throw new Error("Method 'processPayment' must be implemented.");
        }
        
        validateForm() {
            throw new Error("Method 'validateForm' must be implemented.");
        }
        
        getPaymentForm() {
            throw new Error("Method 'getPaymentForm' must be implemented.");
        }
    }
    
    // Credit Card Payment Strategy
    class CreditCardStrategy extends PaymentStrategy {
        constructor() {
            super();
            this.formId = 'card-payment-form';
        }
        
        processPayment(amount) {
            return new Promise((resolve, reject) => {
                // Simulate payment processing
                console.log(`Processing credit card payment of $${amount}`);
                
                // Simulate network delay
                setTimeout(() => {
                    // Mock successful payment (in a real app, this would call a payment gateway API)
                    const success = true;
                    
                    if (success) {
                        resolve({
                            success: true,
                            transactionId: 'CS-' + Math.floor(10000000 + Math.random() * 90000000),
                            message: 'Payment processed successfully'
                        });
                    } else {
                        reject({
                            success: false,
                            message: 'Payment failed. Please try again.'
                        });
                    }
                }, 1500);
            });
        }
        
        validateForm() {
            const cardName = document.getElementById('card-name').value.trim();
            const cardNumber = document.getElementById('card-number').value.trim().replace(/\s/g, '');
            const expiryDate = document.getElementById('expiry-date').value.trim();
            const cvv = document.getElementById('cvv').value.trim();
            
            // Basic validation
            if (!cardName) {
                return { valid: false, message: 'Please enter the name on card' };
            }
            
            if (!cardNumber || cardNumber.length < 15 || cardNumber.length > 16 || !/^\d+$/.test(cardNumber)) {
                return { valid: false, message: 'Please enter a valid card number' };
            }
            
            if (!expiryDate || !expiryDate.match(/^\d{2}\/\d{2}$/)) {
                return { valid: false, message: 'Please enter a valid expiry date (MM/YY)' };
            }
            
            if (!cvv || cvv.length < 3 || !(/^\d+$/.test(cvv))) {
                return { valid: false, message: 'Please enter a valid CVV' };
            }
            
            return { valid: true };
        }
        
        getPaymentForm() {
            return document.getElementById(this.formId);
        }
    }
    
    // PayPal Payment Strategy (not fully implemented)
    class PayPalStrategy extends PaymentStrategy {
        constructor() {
            super();
            this.formId = 'paypal-payment-form';
        }
        
        processPayment(amount) {
            return new Promise((resolve, reject) => {
                reject({
                    success: false,
                    message: 'PayPal payments are not available yet.'
                });
            });
        }
        
        validateForm() {
            return { valid: false, message: 'PayPal payments are not available yet.' };
        }
        
        getPaymentForm() {
            return document.getElementById(this.formId);
        }
    }
    
    // Apple Pay Payment Strategy (not fully implemented)
    class ApplePayStrategy extends PaymentStrategy {
        constructor() {
            super();
            this.formId = 'apple-payment-form';
        }
        
        processPayment(amount) {
            return new Promise((resolve, reject) => {
                reject({
                    success: false,
                    message: 'Apple Pay payments are not available yet.'
                });
            });
        }
        
        validateForm() {
            return { valid: false, message: 'Apple Pay payments are not available yet.' };
        }
        
        getPaymentForm() {
            return document.getElementById(this.formId);
        }
    }
    
    // Payment Context - manages the payment strategy
    class PaymentContext {
        constructor() {
            // Default to credit card strategy
            this.strategy = new CreditCardStrategy();
            this.amount = parseFloat(selectedPrice);
        }
        
        setStrategy(strategy) {
            this.strategy = strategy;
        }
        
        async executePayment() {
            const validation = this.strategy.validateForm();
            
            if (!validation.valid) {
                alert(validation.message);
                return false;
            }
            
            try {
                const result = await this.strategy.processPayment(this.amount);
                return result;
            } catch (error) {
                alert(error.message || 'Payment failed. Please try again.');
                return false;
            }
        }
        
        showPaymentForm() {
            // Hide all payment forms
            document.querySelectorAll('.payment-form').forEach(form => {
                form.classList.remove('active');
            });
            
            // Show the selected payment form
            const form = this.strategy.getPaymentForm();
            if (form) {
                form.classList.add('active');
            }
        }
    }
    
    // Initialize payment context
    const paymentContext = new PaymentContext();
    
    // Payment method selection
    const paymentMethods = document.querySelectorAll('.payment-method:not(.disabled)');
    
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            // Remove active class from all methods
            paymentMethods.forEach(m => m.classList.remove('active'));
            
            // Add active class to selected method
            this.classList.add('active');
            
            // Set the appropriate strategy based on selected method
            const methodType = this.getAttribute('data-method');
            
            switch (methodType) {
                case 'card':
                    paymentContext.setStrategy(new CreditCardStrategy());
                    break;
                case 'paypal':
                    paymentContext.setStrategy(new PayPalStrategy());
                    break;
                case 'apple':
                    paymentContext.setStrategy(new ApplePayStrategy());
                    break;
                default:
                    paymentContext.setStrategy(new CreditCardStrategy());
            }
            
            // Show the appropriate payment form
            paymentContext.showPaymentForm();
        });
    });
    
    // Format card number with spaces
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = '';
            
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
            
            e.target.value = formattedValue;
        });
    }
    
    // Format expiry date with slash
    const expiryDateInput = document.getElementById('expiry-date');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            
            e.target.value = value;
        });
    }
    
    // Handle payment confirmation
    const confirmPaymentButton = document.getElementById('confirm-payment');
    if (confirmPaymentButton) {
        confirmPaymentButton.addEventListener('click', async function() {
            // Disable button and show loading state
            confirmPaymentButton.disabled = true;
            confirmPaymentButton.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i> Processing...';
            
            // Execute payment using the current strategy
            const result = await paymentContext.executePayment();
            
            if (result && result.success) {
                // Show success UI
                document.getElementById('payment-container').classList.add('hidden');
                document.getElementById('payment-success').classList.remove('hidden');
                
                // Update receipt details
                document.getElementById('receipt-plan').textContent = `${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan`;
                document.getElementById('receipt-amount').textContent = `$${selectedPrice}.00`;
                document.getElementById('receipt-date').textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                document.getElementById('receipt-transaction').textContent = result.transactionId;
                
                // Update progress steps
                document.getElementById('step3-circle').classList.remove('bg-gray-300', 'text-gray-600');
                document.getElementById('step3-circle').classList.add('bg-purple-600', 'text-white');
                document.getElementById('step3-line').classList.remove('bg-gray-300');
                document.getElementById('step3-line').classList.add('bg-purple-600');
            } else {
                // Reset button state
                confirmPaymentButton.disabled = false;
                confirmPaymentButton.innerHTML = 'Confirm Payment';
            }
        });
    }
    
    // Check authentication status and redirect if not logged in
    async function checkAuthStatus() {
        try {
            const { data } = await supabaseClient.auth.getSession();
            const session = data.session;
            
            if (!session) {
                // User is not logged in, redirect to login page
                alert('Please log in to complete your subscription.');
                window.location.href = 'login.html?redirect=subscription.html';
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
        }
    }
    
    // Check authentication status
    checkAuthStatus();
});

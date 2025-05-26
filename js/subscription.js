document.addEventListener('DOMContentLoaded', function() {
    console.log('Subscription page initialized');
    
    // Initialize the subscription validator
    const validator = new SubscriptionValidator(supabaseClient);
    
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
    
    // Subscription dropdown toggle
    const subscriptionDropdownBtn = document.getElementById('subscription-dropdown-btn');
    const subscriptionDropdown = document.getElementById('subscription-dropdown');
    
    if (subscriptionDropdownBtn && subscriptionDropdown) {
        subscriptionDropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            subscriptionDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!subscriptionDropdownBtn.contains(e.target) && !subscriptionDropdown.contains(e.target)) {
                subscriptionDropdown.classList.remove('active');
            }
        });
    }
    
    // Current subscription section
    const currentSubscriptionSection = document.getElementById('current-subscription-section');
    const currentPlanName = document.getElementById('current-plan-name');
    const currentPlanPrice = document.getElementById('current-plan-price');
    const connectionsCount = document.getElementById('connections-count');
    const connectionsBar = document.getElementById('connections-bar');
    const promptsCount = document.getElementById('prompts-count');
    const promptsBar = document.getElementById('prompts-bar');
    const cooldownStatus = document.getElementById('cooldown-status');
    const cooldownTimer = document.getElementById('cooldown-timer');
    const cooldownTime = document.getElementById('cooldown-time');
    const planFeaturesList = document.getElementById('plan-features-list');
    
    // Get all subscription buttons
    const subscribeButtons = document.querySelectorAll('.btn-subscribe');
    
    // Add click event to each subscribe button
    subscribeButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // Get plan details from data attributes
            const plan = this.getAttribute('data-plan');
            const price = this.getAttribute('data-price');
            const planId = this.getAttribute('data-plan-id');
            
            // Check if user is logged in
            const { data } = await supabaseClient.auth.getSession();
            const session = data.session;
            
            if (!session) {
                // Show login required message with SweetAlert2
                Swal.fire({
                    title: 'Login Required',
                    text: 'Please log in to subscribe to a plan.',
                    icon: 'info',
                    confirmButtonText: 'Go to Login',
                    confirmButtonColor: '#8B5CF6',
                    showCancelButton: false,
                    customClass: {
                        confirmButton: 'bg-gradient-to-r from-purple-600 to-pink-600'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Redirect to login page
                        window.location.href = 'login.html?redirect=subscription.html';
                    }
                });
                return;
            }
            
            // Confirm subscription change with SweetAlert2
            Swal.fire({
                title: 'Confirm Subscription Change',
                text: `Are you sure you want to ${price === '0' ? 'downgrade to' : 'upgrade to'} the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan for $${price}/month?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, Change Plan',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#8B5CF6',
                cancelButtonColor: '#6B7280',
                customClass: {
                    confirmButton: 'bg-gradient-to-r from-purple-600 to-pink-600'
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        // Show loading state
                        button.disabled = true;
                        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

                        // First check if the user already has a subscription
                        const { data: existingSubscription, error: checkError } = await supabaseClient
                            .from('subscriptions')
                            .select('*')
                            .eq('user_id', session.user.id)
                            .single();

                        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
                            throw checkError;
                        }

                        let subscriptionData, subscriptionError;

                        if (existingSubscription) {
                            // Update existing subscription
                            const result = await supabaseClient
                                .from('subscriptions')
                                .update({
                                    plan_id: planId,
                                    status: 'active',
                                    start_date: new Date().toISOString(),
                                    end_date: null,
                                    updated_at: new Date().toISOString()
                                })
                                .eq('user_id', session.user.id)
                                .select();

                            subscriptionData = result.data;
                            subscriptionError = result.error;

                            // Log the update result for debugging
                            console.log('Subscription update result:', result);
                        } else {
                            // Insert new subscription
                            const result = await supabaseClient
                                .from('subscriptions')
                                .insert({
                                    user_id: session.user.id,
                                    plan_id: planId,
                                    status: 'active',
                                    start_date: new Date().toISOString(),
                                    end_date: null,
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                })
                                .select();

                            subscriptionData = result.data;
                            subscriptionError = result.error;

                            // Log the insert result for debugging
                            console.log('Subscription insert result:', result);
                        }

                        if (subscriptionError) throw subscriptionError;

                        // Update UI with SweetAlert2
                        Swal.fire({
                            title: 'Success!',
                            text: `Successfully ${price === '0' ? 'downgraded to' : 'upgraded to'} the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan!`,
                            icon: 'success',
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#8B5CF6',
                            customClass: {
                                confirmButton: 'bg-gradient-to-r from-purple-600 to-pink-600'
                            }
                        }).then(() => {
                            // Reload page to reflect changes
                            window.location.reload();
                        });
                    } catch (error) {
                        console.error('Error updating subscription:', error);

                        // Show error with SweetAlert2
                        Swal.fire({
                            title: 'Error!',
                            text: `Error updating subscription: ${error.message}`,
                            icon: 'error',
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#8B5CF6',
                            customClass: {
                                confirmButton: 'bg-gradient-to-r from-purple-600 to-pink-600'
                            }
                        });

                        // Reset button
                        button.disabled = false;
                        button.innerHTML = 'Subscribe';
                    }
                }
            });
        });
    });

    // Cancel subscription button
    const cancelSubscriptionBtn = document.getElementById('cancel-subscription-btn');
    const mobileCancelSubscriptionBtn = document.getElementById('mobile-cancel-subscription-btn');

    const handleCancelSubscription = async function() {
        // Check if user is logged in
        const { data } = await supabaseClient.auth.getSession();
        const session = data.session;
        
        if (!session) {
            // Show login required message with SweetAlert2
            Swal.fire({
                title: 'Login Required',
                text: 'Please log in to manage your subscription.',
                icon: 'info',
                confirmButtonText: 'Go to Login',
                confirmButtonColor: '#8B5CF6',
                showCancelButton: false,
                customClass: {
                    confirmButton: 'bg-gradient-to-r from-purple-600 to-pink-600'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    // Redirect to login page
                    window.location.href = 'login.html?redirect=subscription.html';
                }
            });
            return;
        }
        
        // Confirm cancellation with SweetAlert2
        Swal.fire({
            title: 'Confirm Cancellation',
            text: 'Are you sure you want to cancel your subscription? You will be downgraded to the Free plan at the end of your current billing period.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Cancel Subscription',
            cancelButtonText: 'No, Keep My Plan',
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            customClass: {
                confirmButton: 'bg-gradient-to-r from-red-500 to-red-600'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Update subscription in Supabase
                    const { data: subscriptionData, error: subscriptionError } = await supabaseClient
                        .from('subscriptions')
                        .update({
                            status: 'cancelled',
                            updated_at: new Date().toISOString()
                        })
                        .eq('user_id', session.user.id);
                    
                    if (subscriptionError) throw subscriptionError;
                    
                    // Update UI with SweetAlert2
                    Swal.fire({
                        title: 'Subscription Cancelled',
                        text: 'Your subscription has been cancelled. You will be downgraded to the Free plan at the end of your current billing period.',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#8B5CF6',
                        customClass: {
                            confirmButton: 'bg-gradient-to-r from-purple-600 to-pink-600'
                        }
                    }).then(() => {
                        // Reload page to reflect changes
                        window.location.reload();
                    });
                } catch (error) {
                    console.error('Error cancelling subscription:', error);
                    
                    // Show error with SweetAlert2
                    Swal.fire({
                        title: 'Error!',
                        text: `Error cancelling subscription: ${error.message}`,
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#8B5CF6',
                        customClass: {
                            confirmButton: 'bg-gradient-to-r from-purple-600 to-pink-600'
                        }
                    });
                }
            }
        });
    };
    
    if (cancelSubscriptionBtn) {
        cancelSubscriptionBtn.addEventListener('click', handleCancelSubscription);
    }
    
    if (mobileCancelSubscriptionBtn) {
        mobileCancelSubscriptionBtn.addEventListener('click', handleCancelSubscription);
    }
    
    // Upgrade plan buttons
    const upgradeBtn = document.getElementById('upgrade-plan-btn');
    const mobileUpgradeBtn = document.getElementById('mobile-upgrade-plan-btn');
    
    const handleUpgrade = function() {
        // Scroll to plans section
        document.querySelector('.subscription-dropdown').classList.remove('active');
        window.scrollTo({
            top: document.querySelector('.py-16').offsetTop - 100,
            behavior: 'smooth'
        });
    };
    
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', handleUpgrade);
    }
    
    if (mobileUpgradeBtn) {
        mobileUpgradeBtn.addEventListener('click', handleUpgrade);
    }
    
    // Check authentication status and load user's subscription data
    async function loadUserSubscription() {
        try {
            const { data } = await supabaseClient.auth.getSession();
            const session = data.session;
            
            if (!session) {
                // User is not logged in
                console.log('User not logged in - showing login/signup links');
                document.querySelectorAll('.logout-button').forEach(btn => btn.classList.add('hidden'));
                document.querySelectorAll('a[href="signup.html"]').forEach(link => link.classList.remove('hidden'));
                document.querySelectorAll('a[href="login.html"]').forEach(link => link.classList.remove('hidden'));
                return;
            }
            
            // User is logged in
            console.log('User logged in - hiding login/signup links');
            document.querySelectorAll('.logout-button').forEach(btn => btn.classList.remove('hidden'));
            document.querySelectorAll('a[href="signup.html"]').forEach(link => link.classList.add('hidden'));
            document.querySelectorAll('a[href="login.html"]').forEach(link => link.classList.add('hidden'));
            
            // Show current subscription section
            if (currentSubscriptionSection) {
                currentSubscriptionSection.classList.remove('hidden');
            }
            
            // Fetch user's subscription data
            let { data: subscriptionData, error: subscriptionError } = await supabaseClient
                .from('subscriptions')
                .select(`
                    *,
                    subscription_plans(*)
                `)
                .eq('user_id', session.user.id)
                .single();
            
            if (subscriptionError && subscriptionError.code !== 'PGRST116') {
                // PGRST116 is the error code for no rows returned
                console.error('Error fetching subscription:', subscriptionError);
                return;
            }
            
            if (!subscriptionData) {
                console.log('No subscription found for user, creating free plan subscription');
                
                // Get the free plan ID
                const { data: freePlan, error: freePlanError } = await supabaseClient
                    .from('subscription_plans')
                    .select('id')
                    .eq('name', 'Free')
                    .single();
                
                if (freePlanError) {
                    console.error('Error fetching free plan:', freePlanError);
                    return;
                }
                
                // Create a new subscription for the user with the free plan
                const { data: newSubscription, error: newSubscriptionError } = await supabaseClient
                    .from('subscriptions')
                    .insert({
                        user_id: session.user.id,
                        plan_id: freePlan.id,
                        status: 'active',
                        start_date: new Date().toISOString(),
                        end_date: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select(`
                        *,
                        subscription_plans(*)
                    `)
                    .single();
                
                if (newSubscriptionError) {
                    console.error('Error creating subscription:', newSubscriptionError);
                    return;
                }
                
                // Use the newly created subscription - use let instead of const for subscriptionData above
                return loadUserSubscription(); // Reload to get fresh data
            }
            
            // Update UI with subscription data
            const plan = subscriptionData.subscription_plans;
            
            if (currentPlanName) currentPlanName.textContent = plan.name;
            if (currentPlanPrice) currentPlanPrice.textContent = `($${plan.price}/${plan.interval})`;
            
            // Fetch user's connection count
            console.log(`[SUBSCRIPTION] ${new Date().toISOString()} - Fetching connection count for user ${session.user.id}`);
            const { data: connectionsData, error: connectionsError } = await supabaseClient
                .from('connections')
                .select('*')
                .or(`initiator_user_id.eq.${session.user.id},target_user_id.eq.${session.user.id}`);
            
            if (!connectionsError) {
                const connectionCount = connectionsData ? connectionsData.length : 0;
                const maxConnections = plan.max_connections;
                
                console.log(`[SUBSCRIPTION] ${new Date().toISOString()} - Connection count: ${connectionCount}/${maxConnections}`);
                
                if (connectionsCount) {
                    connectionsCount.textContent = `${connectionCount}/${maxConnections}`;
                    console.log(`[SUBSCRIPTION] ${new Date().toISOString()} - Updated connection count display`);
                }
                
                if (connectionsBar) {
                    connectionsBar.style.width = `${(connectionCount / maxConnections) * 100}%`;
                    console.log(`[SUBSCRIPTION] ${new Date().toISOString()} - Updated connection bar width: ${(connectionCount / maxConnections) * 100}%`);
                }
            } else {
                console.error(`[SUBSCRIPTION ERROR] ${new Date().toISOString()} - Error fetching connections:`, connectionsError);
            }
            
            // Fetch user's AI prompt usage for today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const { data: promptsData, error: promptsError } = await supabaseClient
                .from('ai_prompt_usage')
                .select('*')
                .eq('user_id', session.user.id)
                .gte('created_at', today.toISOString());
            
            if (!promptsError) {
                const promptCount = promptsData ? promptsData.length : 0;
                const maxPrompts = plan.daily_ai_prompts;
                
                if (promptsCount) promptsCount.textContent = `${promptCount}/${maxPrompts}`;
                if (promptsBar) promptsBar.style.width = `${(promptCount / maxPrompts) * 100}%`;
            }
            
            // Check cooldown status
            if (plan.chat_cooldown_hours === 0) {
                // No cooldown for this plan
                if (cooldownStatus) {
                    cooldownStatus.textContent = 'No Cooldown';
                    cooldownStatus.classList.remove('bg-green-100', 'text-green-800');
                    cooldownStatus.classList.add('bg-purple-100', 'text-purple-800');
                }
                if (cooldownTimer) cooldownTimer.classList.add('hidden');
            } else {
                // Check last chat time
                const { data: lastChatData, error: lastChatError } = await supabaseClient
                    .from('ai_prompt_usage')
                    .select('created_at')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false })
                    .limit(1);
                
                if (!lastChatError && lastChatData && lastChatData.length > 0) {
                    const lastChatTime = new Date(lastChatData[0].created_at);
                    const cooldownTime = new Date(lastChatTime.getTime() + plan.chat_cooldown_hours * 60 * 60 * 1000);
                    const now = new Date();
                    
                    if (cooldownTime > now) {
                        // Cooldown still active
                        const timeRemaining = cooldownTime - now;
                        const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
                        const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
                        const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
                        
                        if (cooldownStatus) {
                            cooldownStatus.textContent = 'Cooling Down';
                            cooldownStatus.classList.remove('bg-green-100', 'text-green-800');
                            cooldownStatus.classList.add('bg-red-100', 'text-red-800');
                        }
                        
                        if (cooldownTimer) {
                            cooldownTimer.classList.remove('hidden');
                            cooldownTime.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                            
                            // Update timer every second
                            const timerInterval = setInterval(() => {
                                const now = new Date();
                                const timeRemaining = cooldownTime - now;
                                
                                if (timeRemaining <= 0) {
                                    clearInterval(timerInterval);
                                    cooldownStatus.textContent = 'Ready';
                                    cooldownStatus.classList.remove('bg-red-100', 'text-red-800');
                                    cooldownStatus.classList.add('bg-green-100', 'text-green-800');
                                    cooldownTimer.classList.add('hidden');
                                    return;
                                }
                                
                                const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
                                const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
                                const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
                                
                                cooldownTime.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                            }, 1000);
                        }
                    }
                }
            }
            
            // Populate plan features
            if (planFeaturesList) {
                planFeaturesList.innerHTML = '';
                
                const features = [
                    `<i class="fas fa-user-friends mr-2"></i> Maximum ${plan.max_connections} ${plan.max_connections === 1 ? 'connection' : 'connections'}`,
                    `<i class="fas fa-robot mr-2"></i> ${plan.daily_ai_prompts === 999999 ? 'Unlimited' : plan.daily_ai_prompts} AI prompts per day`,
                    `<i class="fas fa-clock mr-2"></i> ${plan.chat_cooldown_hours === 0 ? 'No' : plan.chat_cooldown_hours + '-hour'} chat cooldown`,
                    `<i class="fas fa-credit-card mr-2"></i> ${plan.price === '0.00' ? 'Free' : '$' + plan.price + '/' + plan.interval}`
                ];
                
                features.forEach(feature => {
                    const li = document.createElement('li');
                    li.className = 'flex items-center feature-item';
                    li.innerHTML = feature;
                    planFeaturesList.appendChild(li);
                });
            }
            
            // Update subscription buttons
            subscribeButtons.forEach(button => {
                const buttonPlanId = button.getAttribute('data-plan-id');
                
                if (buttonPlanId === plan.id.toString()) {
                    button.textContent = 'Current Plan';
                    button.disabled = true;
                    button.classList.remove('bg-purple-600', 'hover:bg-purple-700');
                    button.classList.add('bg-gray-400', 'cursor-not-allowed');
                } else if (parseInt(buttonPlanId) < parseInt(plan.id)) {
                    button.textContent = 'Downgrade';
                } else {
                    button.textContent = 'Upgrade';
                }
            });
        } catch (error) {
            console.error('Error loading user subscription:', error);
        }
    }
    
    // Check authentication status and load user's subscription data
    async function loadUserSubscription() {
        try {
            // Check if user is logged in
            const { data } = await supabaseClient.auth.getSession();
            const session = data.session;
            
            if (!session) {
                console.log('User not logged in');
                return;
            }
            
            // Get the user's subscription from Supabase
            const { data: subscription, error } = await supabaseClient
                .from('subscriptions')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('status', 'active')
                .maybeSingle();
            
            if (error) throw error;
            
            if (subscription) {
                // Show current subscription section
                if (currentSubscriptionSection) {
                    currentSubscriptionSection.classList.remove('hidden');
                }
                
                // Get the plan data from subscription_plans table using plan_id
                const { data: plan, error: planError } = await supabaseClient
                    .from('subscription_plans')
                    .select('*')
                    .eq('id', subscription.plan_id)
                    .single();
                    
                if (planError) {
                    console.error('Error fetching plan data:', planError);
                    return;
                }
                
                // Update UI with plan details
                if (currentPlanName) currentPlanName.textContent = plan.name;
                if (currentPlanPrice) currentPlanPrice.textContent = `$${plan.price}/month`;
                
                // Get connection count using the SubscriptionValidator - same as on Find Yourself page
                const connectionStatus = await validator.canCreateConnection();
                const usedConnections = connectionStatus.currentCount || 0;
                const maxConnections = connectionStatus.maxCount || plan.max_connections || 0;
                
                // Get actual AI prompt usage for today
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const { data: promptsData, error: promptsError } = await supabaseClient
                    .from('ai_prompt_usage')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .gte('created_at', today.toISOString());
                
                const usedPrompts = promptsError ? 0 : (promptsData ? promptsData.length : 0);
                
                // Check for actual cooldown based on last chat
                let remainingCooldownTime = 0;
                
                if (plan.chat_cooldown_hours > 0) {
                    const { data: lastChatData, error: lastChatError } = await supabaseClient
                        .from('ai_prompt_usage')
                        .select('created_at')
                        .eq('user_id', session.user.id)
                        .order('created_at', { ascending: false })
                        .limit(1);
                    
                    if (!lastChatError && lastChatData && lastChatData.length > 0) {
                        const lastChatTime = new Date(lastChatData[0].created_at);
                        const cooldownEndTime = new Date(lastChatTime.getTime() + plan.chat_cooldown_hours * 60 * 60 * 1000);
                        const now = new Date();
                        
                        if (cooldownEndTime > now) {
                            // Calculate remaining cooldown in minutes
                            remainingCooldownTime = Math.ceil((cooldownEndTime - now) / (60 * 1000));
                        }
                    }
                }
                
                // Update UI with usage data
                if (connectionsCount) {
                    connectionsCount.textContent = `${usedConnections}/${maxConnections || 'Unlimited'}`;
                    
                    // Add color coding like on Find Yourself page
                    if (usedConnections >= maxConnections) {
                        connectionsCount.classList.add('text-red-600', 'font-bold');
                    } else if (usedConnections >= maxConnections * 0.8) {
                        connectionsCount.classList.add('text-yellow-600', 'font-bold');
                    } else {
                        connectionsCount.classList.remove('text-red-600', 'text-yellow-600', 'font-bold');
                    }
                }
                
                if (connectionsBar && maxConnections) {
                    const connectionPercentage = (usedConnections / maxConnections) * 100;
                    connectionsBar.style.width = `${connectionPercentage}%`;
                    connectionsBar.style.backgroundColor = connectionPercentage > 80 ? '#EF4444' : '#8B5CF6';
                }
                
                if (promptsCount) {
                    promptsCount.textContent = `${usedPrompts}/${plan.max_prompts || 'Unlimited'}`;
                }
                
                if (promptsBar && plan.max_prompts) {
                    const promptsPercentage = (usedPrompts / plan.max_prompts) * 100;
                    promptsBar.style.width = `${promptsPercentage}%`;
                    promptsBar.style.backgroundColor = promptsPercentage > 80 ? '#EF4444' : '#8B5CF6';
                }
                
                // Update cooldown status
                if (cooldownStatus && cooldownTimer) {
                    if (plan.cooldown_minutes && remainingCooldownTime > 0) {
                        cooldownStatus.textContent = 'Active';
                        cooldownStatus.classList.add('text-red-600');
                        cooldownTimer.classList.remove('hidden');
                        if (cooldownTime) cooldownTime.textContent = `${remainingCooldownTime} minutes`;
                    } else {
                        cooldownStatus.textContent = 'None';
                        cooldownStatus.classList.add('text-green-600');
                        cooldownTimer.classList.add('hidden');
                    }
                }
                
                // Update plan features list
                if (planFeaturesList) {
                    planFeaturesList.innerHTML = '';
                    
                    // Fake features (in a real app, you would get these from the database)
                    const features = [
                        { name: `${plan.max_connections || 'Unlimited'} Connections`, included: true },
                        { name: `${plan.max_prompts || 'Unlimited'} Prompts per month`, included: true },
                        { name: 'AI Content Generation', included: true },
                        { name: 'Advanced Analytics', included: plan.name !== 'Free' },
                        { name: 'Priority Support', included: plan.name === 'Premium' },
                        { name: 'Custom Templates', included: plan.name === 'Premium' }
                    ];
                    
                    features.forEach(feature => {
                        const li = document.createElement('li');
                        li.className = 'flex items-center mb-2';
                        li.innerHTML = `
                            <svg class="w-4 h-4 mr-2 ${feature.included ? 'text-green-500' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                ${feature.included ? 
                                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>' : 
                                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>'}
                            </svg>
                            <span class="${feature.included ? 'text-gray-700' : 'text-gray-400'}">${feature.name}</span>
                        `;
                        planFeaturesList.appendChild(li);
                    });
                }
                
                // Update subscription buttons
                subscribeButtons.forEach(button => {
                    const buttonPlanId = button.getAttribute('data-plan-id');
                    
                    if (buttonPlanId === plan.id.toString()) {
                        button.textContent = 'Current Plan';
                        button.disabled = true;
                        button.classList.remove('bg-purple-600', 'hover:bg-purple-700');
                        button.classList.add('bg-gray-400', 'cursor-not-allowed');
                    } else if (parseInt(buttonPlanId) < parseInt(plan.id)) {
                        button.textContent = 'Downgrade';
                    } else {
                        button.textContent = 'Upgrade';
                    }
                });
            }
        } catch (error) {
            console.error('Error loading user subscription:', error);
        }
    }
    
    // Load user's subscription data
    loadUserSubscription();
});

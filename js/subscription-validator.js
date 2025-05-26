/**
 * Subscription Validator
 * 
 * This module provides functions to validate user actions based on their subscription plan.
 * It enforces restrictions such as:
 * - Connection limits
 * - AI Advisor prompt usage limits
 * - Chat cooldown periods
 */

class SubscriptionValidator {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.userSubscription = null;
        this.userPlan = null;
        this.userId = null;
    }

    /**
     * Initialize the validator by loading the user's subscription data
     */
    async initialize() {
        try {
            const { data } = await this.supabase.auth.getSession();
            const session = data.session;
            
            if (!session) {
                console.log('User not logged in');
                return false;
            }
            
            this.userId = session.user.id;
            
            // Fetch user's subscription data
            const { data: subscriptionData, error: subscriptionError } = await this.supabase
                .from('subscriptions')
                .select(`
                    *,
                    subscription_plans(*)
                `)
                .eq('user_id', this.userId)
                .single();
            
            if (subscriptionError && subscriptionError.code !== 'PGRST116') {
                // PGRST116 is the error code for no rows returned
                console.error('Error fetching subscription:', subscriptionError);
                return false;
            }
            
            if (!subscriptionData) {
                console.log('No subscription found for user, creating free plan subscription');
                
                // Get the free plan ID
                const { data: freePlan, error: freePlanError } = await this.supabase
                    .from('subscription_plans')
                    .select('*')
                    .eq('name', 'Free')
                    .single();
                
                if (freePlanError) {
                    console.error('Error fetching free plan:', freePlanError);
                    return false;
                }
                
                // Create a new subscription for the user with the free plan
                const { data: newSubscription, error: newSubscriptionError } = await this.supabase
                    .from('subscriptions')
                    .insert({
                        user_id: this.userId,
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
                    return false;
                }
                
                this.userSubscription = newSubscription;
                this.userPlan = newSubscription.subscription_plans;
                
                console.log('Created new subscription with Free plan:', this.userPlan);
            } else {
                this.userSubscription = subscriptionData;
                this.userPlan = subscriptionData.subscription_plans;
                console.log('Loaded existing subscription:', this.userPlan);
            }
            
            return true;
        } catch (error) {
            console.error('Error initializing subscription validator:', error);
            return false;
        }
    }

    /**
     * Refresh connection data from the database
     * This method is used to ensure we have the latest connection count
     * @returns {Promise<boolean>} Success status
     */
    async refreshConnectionData() {
        try {
            if (!this.userId) {
                const { data } = await this.supabase.auth.getSession();
                const session = data.session;
                
                if (!session) {
                    console.log('User not logged in');
                    return false;
                }
                
                this.userId = session.user.id;
            }
            
            const timestamp = new Date().toISOString();
            console.log(`%c[CONNECTION] ${timestamp} - Refreshing connection data for user ${this.userId}`, 'color: #2196F3');
            
            // Count ALL connection requests (including pending), not just accepted ones
            const { data: connectionsData, error: connectionsError } = await this.supabase
                .from('connections')
                .select('*')
                .or(`initiator_user_id.eq.${this.userId},target_user_id.eq.${this.userId}`);
            
            if (connectionsError) {
                console.error(`%c[CONNECTION ERROR] ${timestamp} - Error refreshing connections data:`, 'color: #F44336; font-weight: bold', connectionsError);
                return false;
            }
            
            // Cache the connection count for quick access
            this._connectionCount = connectionsData ? connectionsData.length : 0;
            console.log(`%c[CONNECTION] ${timestamp} - Refreshed connection count: ${this._connectionCount}`, 'color: #2196F3');
            
            return true;
        } catch (error) {
            const timestamp = new Date().toISOString();
            console.error(`%c[CONNECTION ERROR] ${timestamp} - Error in refreshConnectionData:`, 'color: #F44336; font-weight: bold', error);
            return false;
        }
    }
    
    /**
     * Check if a user can create a new connection
     * @returns {Promise<Object>} Object with canConnect boolean and message
     */
    async canCreateConnection() {
        // Always refresh the subscription data to ensure we have the latest plan
        await this.initialize();
        
        if (!this.userPlan) {
            return { canConnect: false, message: 'Unable to verify subscription status' };
        }
        
        const timestamp = new Date().toISOString();
        
        // Explicitly log the current plan for debugging
        console.log(`%c[CONNECTION] ${timestamp} - Checking connection limit for plan: ${this.userPlan.name}`, 'color: #2196F3');
        console.log(`%c[CONNECTION] ${timestamp} - Max connections allowed: ${this.userPlan.max_connections}`, 'color: #2196F3');
        
        // Use cached connection count if available, otherwise fetch from database
        let connectionCount;
        
        if (this._connectionCount !== undefined) {
            // Use cached connection count
            connectionCount = this._connectionCount;
            console.log(`%c[CONNECTION] ${timestamp} - Using cached connection count: ${connectionCount}`, 'color: #2196F3');
        } else {
            // Count ALL connection requests (including pending), not just accepted ones
            const { data: connectionsData, error: connectionsError } = await this.supabase
                .from('connections')
                .select('*')
                .or(`initiator_user_id.eq.${this.userId},target_user_id.eq.${this.userId}`);
            
            if (connectionsError) {
                console.error(`%c[CONNECTION ERROR] ${timestamp} - Error fetching connections:`, 'color: #F44336; font-weight: bold', connectionsError);
                return { canConnect: false, message: 'Error checking connection limit' };
            }
            
            connectionCount = connectionsData ? connectionsData.length : 0;
            this._connectionCount = connectionCount; // Cache the count
            console.log(`%c[CONNECTION] ${timestamp} - Fetched new connection count: ${connectionCount}`, 'color: #2196F3');
        }
        
        const maxConnections = this.userPlan.max_connections;
        console.log(`%c[CONNECTION] ${timestamp} - Current connection count: ${connectionCount}/${maxConnections}`, 'color: #2196F3');
        
        // Strictly enforce the connection limit
        if (connectionCount >= maxConnections) {
            return { 
                canConnect: false, 
                message: `You've reached your connection limit (${maxConnections}). Upgrade your plan to connect with more people.`,
                currentCount: connectionCount,
                maxCount: maxConnections,
                upgradeRequired: true
            };
        }
        
        return { 
            canConnect: true, 
            message: 'You can create a new connection',
            currentCount: connectionCount,
            maxCount: maxConnections
        };
    }

    /**
     * Check if a user can send an AI prompt
     * @returns {Promise<Object>} Object with canSendPrompt boolean and message
     */
    async canSendAIPrompt() {
        // Always refresh the subscription data to ensure we have the latest plan
        await this.initialize();
        
        if (!this.userPlan) {
            return { canSendPrompt: false, message: 'Unable to verify subscription status' };
        }
        
        // Explicitly log the current plan for debugging
        console.log('Checking AI prompt limit for plan:', this.userPlan.name);
        console.log('Max daily prompts allowed:', this.userPlan.daily_ai_prompts);
        
        // Get today's date (start of day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Count prompts used today
        const { data: promptsData, error: promptsError } = await this.supabase
            .from('ai_prompt_usage')
            .select('*')
            .eq('user_id', this.userId)
            .gte('created_at', today.toISOString());
        
        if (promptsError) {
            console.error('Error fetching prompt usage:', promptsError);
            return { canSendPrompt: false, message: 'Error checking prompt limit' };
        }
        
        const promptCount = promptsData ? promptsData.length : 0;
        const maxPrompts = this.userPlan.daily_ai_prompts;
        
        console.log('Current prompt count:', promptCount);
        
        // Strictly enforce the prompt limit
        if (promptCount >= maxPrompts) {
            return { 
                canSendPrompt: false, 
                message: `You've reached your daily AI prompt limit (${maxPrompts}). Upgrade your plan for more prompts.`,
                currentCount: promptCount,
                maxCount: maxPrompts,
                upgradeRequired: true
            };
        }
        
        return { 
            canSendPrompt: true, 
            message: 'You can send an AI prompt',
            currentCount: promptCount,
            maxCount: maxPrompts
        };
    }

    /**
     * Record an AI prompt usage
     * @returns {Promise<boolean>} Success status
     */
    async recordAIPromptUsage() {
        try {
            if (!this.userId) {
                const { data } = await this.supabase.auth.getSession();
                const session = data.session;
                
                if (!session) {
                    console.log('User not logged in');
                    return false;
                }
                
                this.userId = session.user.id;
            }
            
            // Insert a new prompt usage record
            const { error } = await this.supabase
                .from('ai_prompt_usage')
                .insert({
                    user_id: this.userId,
                    created_at: new Date().toISOString()
                });
            
            if (error) {
                console.error('Error recording prompt usage:', error);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error in recordAIPromptUsage:', error);
            return false;
        }
    }
}

// Export the class to the window object for global access
window.SubscriptionValidator = SubscriptionValidator;

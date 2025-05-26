// Test script to manually trigger the webhook
const WEBHOOK_URL = 'https://jucwtfexhavfkhhfpcdv.supabase.co/functions/v1/contact-notification';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Y3d0ZmV4aGF2ZmtoaGZwY2R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg5MzQzOCwiZXhwIjoyMDYzNDY5NDM4fQ.YfTd6eOomJLUOz7ur-zF1MF_HX9_b1mormupzE4YQ1g';

async function testWebhook() {
  try {
    console.log('Testing webhook directly...');
    
    // Create a test payload that mimics what Supabase webhook would send
    const testPayload = {
      type: 'INSERT',
      table: 'contact_submissions',
      schema: 'public',
      record: {
        id: '12345',
        name: 'Test User',
        email: 'zain33717@gmail.com',
        subject: 'Test Webhook',
        message: 'This is a test message sent directly to the webhook.',
        created_at: new Date().toISOString()
      },
      old_record: null
    };
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify(testPayload)
    });
    
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Webhook test successful!');
    } else {
      console.error('❌ Webhook test failed');
    }
  } catch (error) {
    console.error('❌ Error testing webhook:', error);
  }
}

// Run the test
testWebhook();

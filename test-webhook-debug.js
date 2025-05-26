// Debug script to test webhook with detailed logging
const WEBHOOK_URL = 'https://jucwtfexhavfkhhfpcdv.supabase.co/functions/v1/contact-notification';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Y3d0ZmV4aGF2ZmtoaGZwY2R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg5MzQzOCwiZXhwIjoyMDYzNDY5NDM4fQ.YfTd6eOomJLUOz7ur-zF1MF_HX9_b1mormupzE4YQ1g';

async function testWebhookWithDebug() {
  try {
    console.log('Testing webhook with detailed debug info...');
    
    // Create a test payload that exactly matches what Supabase database trigger would send
    // This is the critical part - making sure our test payload matches what the trigger sends
    const testPayload = {
      type: 'INSERT',
      table: 'contact_submissions',
      schema: 'public',
      record: {
        id: new Date().getTime().toString(),
        name: 'Debug Test User',
        email: 'zain33717@gmail.com',
        subject: 'Debug Webhook Test',
        message: 'This is a debug test message to diagnose webhook issues.',
        created_at: new Date().toISOString()
      },
      old_record: null
    };
    
    console.log('Sending payload:', JSON.stringify(testPayload, null, 2));
    console.log('To URL:', WEBHOOK_URL);
    console.log('With Authorization header starting with:', 'Bearer ' + SERVICE_ROLE_KEY.substring(0, 20) + '...');
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries([...response.headers]));
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Webhook test successful!');
      if (data.emailId) {
        console.log('Email sent with ID:', data.emailId);
      } else {
        console.log('⚠️ No email ID returned in the response');
      }
    } else {
      console.error('❌ Webhook test failed');
    }
  } catch (error) {
    console.error('❌ Error testing webhook:', error);
  }
}

// Run the test
testWebhookWithDebug();

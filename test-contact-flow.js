// Combined test script for contact form submission and email notification
const SUPABASE_URL = 'https://jucwtfexhavfkhhfpcdv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Y3d0ZmV4aGF2ZmtoaGZwY2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4OTM0MzgsImV4cCI6MjA2MzQ2OTQzOH0.r6ExUkPuv03RRcmRGMnNlkqtGUHsQ3wAIbcRIzwqWMo';
const WEBHOOK_URL = 'https://jucwtfexhavfkhhfpcdv.supabase.co/functions/v1/contact-notification';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Y3d0ZmV4aGF2ZmtoaGZwY2R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg5MzQzOCwiZXhwIjoyMDYzNDY5NDM4fQ.YfTd6eOomJLUOz7ur-zF1MF_HX9_b1mormupzE4YQ1g';
const TO_EMAIL = 'zain33717@gmail.com';

async function testContactFormFlow() {
  try {
    console.log('Testing contact form flow...');
    
    // Step 1: Create the contact submission data
    const contactData = {
      name: 'Test User',
      email: TO_EMAIL,
      subject: 'Test Contact Form Flow',
      message: 'This is a test message from the combined test script.',
      created_at: new Date().toISOString()
    };

    console.log('Step 1: Contact data prepared', contactData);
    
    // Step 2: Manually simulate the webhook payload that would be sent on insert
    const webhookPayload = {
      type: 'INSERT',
      table: 'contact_submissions',
      schema: 'public',
      record: contactData,
      old_record: null
    };

    console.log('Step 2: Webhook payload prepared');
    
    // Step 3: Send the webhook request directly
    console.log('Step 3: Sending webhook request...');
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify(webhookPayload)
    });
    
    // Step 4: Process the response
    const responseData = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', responseData);
    
    if (response.ok) {
      console.log('✅ Contact form flow test successful!');
      console.log('Email sent with ID:', responseData.emailId);
    } else {
      console.error('❌ Contact form flow test failed');
    }
  } catch (error) {
    console.error('❌ Error testing contact form flow:', error);
  }
}

// Run the test
testContactFormFlow();

// Test script for Resend API
const RESEND_API_KEY = 're_PvRcMSsC_QJsznmrTqx9TQHC2Vrigrw5n';
const TO_EMAIL = 'zain33717@gmail.com';

async function testResendAPI() {
  try {
    console.log('Testing Resend API...');
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: TO_EMAIL,
        subject: 'Test Email from ConnectSphere',
        html: '<h1>Test Email</h1><p>This is a test email to verify the Resend API is working correctly.</p>'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success! Email sent successfully');
      console.log('Email ID:', data.id);
    } else {
      console.error('❌ Error sending email:', data);
    }
  } catch (error) {
    console.error('❌ Exception occurred:', error);
  }
}

// Run the test
testResendAPI();

// Edge function to send welcome emails to new newsletter subscribers
// This function is triggered by a database webhook when a new subscriber is added

// Import Supabase client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
// Import SendGrid for email sending
import sgMail from 'https://esm.sh/@sendgrid/mail@7.7.0'

// Define your Supabase URL and service role key from environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://jucwtfexhavfkhhfpcdv.supabase.co'
// Always try to use the environment variable first for security
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Y3d0ZmV4aGF2ZmtoaGZwY2R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg5MzQzOCwiZXhwIjoyMDYzNDY5NDM4fQ.YfTd6eOomJLUOz7ur-zF1MF_HX9_b1mormupzE4YQ1g'
// Log if we're using the fallback key
if (!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY environment variable not found, using fallback')
}

// Get SendGrid API key from environment variables
// IMPORTANT: This must be set with: supabase secrets set SENDGRID_API_KEY=your_api_key
const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY') || ''

// Set SendGrid API key
sgMail.setApiKey(sendgridApiKey)

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseKey)

// Send email using SendGrid
async function sendEmail(to, subject, body) {
  console.log(`Sending email to ${to} with subject: ${subject}`)
  
  try {
    console.log('Attempting to send email using SendGrid')
    console.log('SendGrid API key length:', sendgridApiKey ? sendgridApiKey.length : 0)
    
    // Create email message
    const msg = {
      to: to,
      from: 'zain33717@gmail.com', // Use a verified sender in SendGrid
      subject: subject,
      html: body,
      text: 'Welcome to ConnectSphere! Thank you for subscribing to our newsletter.'
    }
    
    console.log('Sending mail with options:', {
      from: msg.from,
      to: msg.to,
      subject: msg.subject
    })
    
    // Send mail
    const response = await sgMail.send(msg)
    
    console.log('Email sent successfully with SendGrid:', response[0].statusCode)
    console.log('Full SendGrid response headers:', JSON.stringify(response[0].headers))
    return true
  } catch (err) {
    console.error('Exception when sending email with SendGrid:', JSON.stringify(err))
    if (err.response) {
      console.error('SendGrid API error response:', JSON.stringify(err.response.body))
    }
    return false
  }
}

// Main Deno request handler
Deno.serve(async (req) => {
  // CORS headers to allow requests from your front-end
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    // Parse the request body
    const body = await req.json()
    console.log('Received webhook payload:', JSON.stringify(body))
    
    // Try to extract the email from different possible payload formats
    let email = null
    
    // Format 1: { record: { email: '...' } }
    if (body.record && body.record.email) {
      email = body.record.email
    }
    // Format 2: { type: 'INSERT', table: '...', record: { email: '...' } }
    else if (body.type === 'INSERT' && body.record && body.record.email) {
      email = body.record.email
    }
    // Format 3: { new: { email: '...' } } 
    else if (body.new && body.new.email) {
      email = body.new.email
    }
    
    // Validate we found an email
    if (!email) {
      console.error('No email found in payload:', body)
      return new Response(JSON.stringify({ 
        error: 'Invalid payload, no email found', 
        receivedPayload: body 
      }), { 
        headers, 
        status: 400 
      })
    }

    // Build the welcome email
    const emailSubject = 'Welcome to ConnectSphere Newsletter!'
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background: linear-gradient(to right, #8b5cf6, #ec4899); padding: 20px; text-align: center; color: white;">
          <h1>Welcome to ConnectSphere!</h1>
        </header>
        <div style="padding: 20px; background-color: #f9fafb;">
          <p>Dear Subscriber,</p>
          <p>Thank you for subscribing to our newsletter! We're excited to share with you:</p>
          <ul>
            <li>The latest relationship advice</li>
            <li>Dating tips and success stories</li>
            <li>Upcoming features and events</li>
          </ul>
          <p>You'll receive our newsletter with valuable content to enhance your journey with ConnectSphere.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://jucwtfexhavfkhhfpcdv.supabase.co" style="background-color: #8b5cf6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Visit ConnectSphere</a>
          </div>
        </div>
        <footer style="background-color: #1f2937; color: #9ca3af; text-align: center; padding: 10px; font-size: 12px;">
          <p>&copy; 2024 ConnectSphere. All rights reserved.</p>
          <p>If you wish to unsubscribe, please <a href="#" style="color: #d1d5db;">click here</a>.</p>
        </footer>
      </div>
    `

    // Send the welcome email
    const emailSent = await sendEmail(email, emailSubject, emailBody)
    
    if (!emailSent) {
      // Don't throw an error, just log it and continue
      console.error('Failed to send welcome email, but continuing with database update')
      // Continue processing without throwing an error
    }

    // Update the subscriber record to mark email as sent
    const { error: updateError } = await supabase
      .from('newsletter_subscribers')
      .update({ 
        last_email_sent: new Date().toISOString() 
      })
      .eq('email', email)
    
    if (updateError) {
      console.error('Error updating subscriber record:', updateError)
    }

    // Return success response
    return new Response(JSON.stringify({ 
      success: true,
      message: `Welcome email sent to ${email}` 
    }), { headers })

  } catch (error) {
    console.error('Error in send-welcome-email function:', error)
    
    // Return error response
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), { 
      headers, 
      status: 500 
    })
  }
})

// Function to send email notifications for contact form submissions and save submissions to database
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// Define types for contact submission
interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at?: string;
  status?: string;
}

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create Supabase client with service role
const createSupabaseAdmin = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://jucwtfexhavfkhhfpcdv.supabase.co';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

// Save contact submission to database using service role (bypasses RLS)
const saveContactSubmission = async (submission: ContactSubmission) => {
  try {
    const supabase = createSupabaseAdmin();
    
    // Ensure created_at is set
    if (!submission.created_at) {
      submission.created_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([submission]);
      
    if (error) {
      console.error('Error saving contact submission:', error);
      throw error;
    }
    
    console.log('Contact submission saved successfully');
    return data;
  } catch (error) {
    console.error('Failed to save contact submission:', error);
    throw error;
  }
};

// Handler for all requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    console.log('Function triggered - processing request')
    
    // Parse the request payload
    const payload = await req.json()
    console.log('Received payload:', JSON.stringify(payload))
    
    // Extract the contact submission data - handle different possible formats
    let record: ContactSubmission | null = null
    
    if (payload.record) {
      // Direct form submission format
      record = payload.record as ContactSubmission
      console.log('Found record in payload.record')
      
      // Save the submission to database
      try {
        await saveContactSubmission(record);
        console.log('Saved form submission to database');
      } catch (saveError) {
        console.error('Error saving form submission:', saveError);
        // Continue to send email even if save fails
      }
    } else if (payload.new) {
      // Database webhook format
      record = payload.new as ContactSubmission
      console.log('Found record in payload.new')
    } else if (payload.data && payload.data.new) {
      // Another possible webhook format
      record = payload.data.new as ContactSubmission
      console.log('Found record in payload.data.new')
    } else {
      // If we can't find a record in any expected location, log the full payload
      console.error('Could not find record in payload. Full payload:', JSON.stringify(payload))
      return new Response(
        JSON.stringify({ 
          message: 'No record found in payload', 
          payload: JSON.stringify(payload)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Ensure record is not null before proceeding
    if (!record) {
      console.error('Record is null after format detection')
      return new Response(
        JSON.stringify({ message: 'Record is null after format detection' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('Processing record:', JSON.stringify(record))
    
    // Format the email content with a professional and modern template
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission - The ConnectSphere</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e5e7eb;">
                
                <!-- Logo Header -->
                <tr>
                  <td style="background-color: #ffffff; padding: 30px 0; text-align: center; border-bottom: 1px solid #f3f4f6;">
                    <!-- Logo SVG inline for email compatibility -->
                    <div style="margin: 0 auto; width: 200px;">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" style="width: 100%; height: auto;">
                        <path d="M20,10 C15,10 10,15 10,20 C10,25 15,30 20,30 C25,30 30,25 30,20 C30,15 25,10 20,10 Z" fill="#8B5CF6"/>
                        <path d="M40,10 C35,10 30,15 30,20 C30,25 35,30 40,30 C45,30 50,25 50,20 C50,15 45,10 40,10 Z" fill="#EC4899"/>
                        <text x="60" y="25" font-family="Arial" font-size="16" font-weight="bold">
                          <tspan fill="#EC4899">The</tspan><tspan fill="#8B5CF6">ConnectSphere</tspan>
                        </text>
                      </svg>
                    </div>
                  </td>
                </tr>
                
                <!-- Main Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #8B5CF6, #EC4899); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">New Contact Inquiry Received</h1>
                    <p style="color: white; margin: 10px 0 0; font-size: 16px; opacity: 0.9;">A potential connection has reached out through your platform</p>
                  </td>
                </tr>
                
                <!-- Intro Text -->
                <tr>
                  <td style="padding: 30px 30px 0 30px; text-align: left;">
                    <p style="margin: 0; color: #4B5563; font-size: 16px; line-height: 24px;">
                      You've received a new inquiry from your website's contact form. Please review the details below and respond at your earliest convenience to maintain excellent connection with your community.
                    </p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 20px 30px;">
                    <!-- Contact Details Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin: 15px 0; border: 1px solid #e5e7eb;">
                      <tr>
                        <td style="padding: 20px;">
                          
                          <!-- Name -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                            <tr>
                              <td width="120" style="font-weight: 600; color: #6D28D9; padding-bottom: 10px; font-size: 15px;">Name:</td>
                              <td style="padding-bottom: 10px; font-size: 15px;">${record.name || 'Not provided'}</td>
                            </tr>
                          </table>
                          
                          <!-- Email -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                            <tr>
                              <td width="120" style="font-weight: 600; color: #6D28D9; padding-bottom: 10px; font-size: 15px;">Email:</td>
                              <td style="padding-bottom: 10px; font-size: 15px;">
                                <a href="mailto:${record.email}" style="color: #2563EB; text-decoration: none;">${record.email || 'Not provided'}</a>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Subject -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                            <tr>
                              <td width="120" style="font-weight: 600; color: #6D28D9; padding-bottom: 10px; font-size: 15px;">Subject:</td>
                              <td style="padding-bottom: 10px; font-size: 15px; font-weight: 500;">${record.subject || 'Not provided'}</td>
                            </tr>
                          </table>
                          
                          <!-- Message -->
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-weight: 600; color: #6D28D9; padding-bottom: 10px; font-size: 15px;">Message:</td>
                            </tr>
                            <tr>
                              <td style="background-color: #ffffff; padding: 15px; border-radius: 6px; font-size: 15px; line-height: 1.5; border: 1px solid #e5e7eb;">
                                ${record.message || 'Not provided'}
                              </td>
                            </tr>
                          </table>
                          
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Action Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                      <tr>
                        <td align="center">
                          <a href="mailto:${record.email}" style="display: inline-block; background: linear-gradient(to right, #8B5CF6, #EC4899); color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                            Reply to Inquiry
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Timestamp -->
                    <p style="text-align: center; font-size: 14px; color: #6B7280; margin: 20px 0 0;">
                      <img src="https://img.icons8.com/ios-glyphs/30/6B7280/time--v1.png" width="14" height="14" style="vertical-align: middle; margin-right: 5px;">
                      Submitted on: ${record.created_at ? new Date(record.created_at).toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : new Date().toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-weight: 600; font-size: 16px;">
                      <span style="color: #EC4899;">The</span><span style="color: #8B5CF6;">ConnectSphere</span>
                    </p>
                    <p style="margin: 8px 0 15px; color: #6B7280; font-size: 14px;">
                      Building meaningful connections in the digital age
                    </p>
                    <div style="margin-top: 20px;">
                      <!-- Social Media Icons -->
                      <a href="#" style="display: inline-block; margin: 0 8px;">
                        <img src="https://img.icons8.com/ios-filled/50/8B5CF6/facebook-new.png" width="24" height="24" alt="Facebook">
                      </a>
                      <a href="#" style="display: inline-block; margin: 0 8px;">
                        <img src="https://img.icons8.com/ios-filled/50/8B5CF6/instagram-new.png" width="24" height="24" alt="Instagram">
                      </a>
                      <a href="#" style="display: inline-block; margin: 0 8px;">
                        <img src="https://img.icons8.com/ios-filled/50/8B5CF6/twitter.png" width="24" height="24" alt="Twitter">
                      </a>
                      <a href="#" style="display: inline-block; margin: 0 8px;">
                        <img src="https://img.icons8.com/ios-filled/50/8B5CF6/linkedin.png" width="24" height="24" alt="LinkedIn">
                      </a>
                    </div>
                    <p style="margin: 20px 0 0; font-size: 12px; color: #9CA3AF;">
                      &copy; ${new Date().getFullYear()} ConnectSphere. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
    
    // Send email using Resend
    const RESEND_API_KEY = 're_PvRcMSsC_QJsznmrTqx9TQHC2Vrigrw5n'
    const TO_EMAIL = 'zain33717@gmail.com'
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: TO_EMAIL,
        subject: `New Contact Form: ${record.subject}`,
        html: emailContent
      })
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to send email')
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email notification sent successfully',
        emailId: result.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error processing webhook:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An error occurred processing the request'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

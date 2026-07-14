// Test script to check email configuration
const apiKey = process.env.BREVO_API_KEY;

console.log('BREVO_API_KEY:', apiKey ? 'Set (length: ' + apiKey.length + ')' : 'NOT SET');

if (!apiKey) {
  console.error('ERROR: BREVO_API_KEY is not set in environment variables');
  console.log('Please add BREVO_API_KEY to your .env.local file');
  process.exit(1);
}

console.log('API Key is configured. Testing email sending...');

async function testEmail() {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        sender: {
          name: 'MAKHSOOS Test',
          email: 'makhsoos708@gmail.com'
        },
        to: [{
          email: 'makhsoos708@gmail.com'
        }],
        subject: 'Test Email from MAKHSOOS',
        htmlContent: '<div><h1>Test Email</h1><p>If you receive this, email configuration is working!</p></div>'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Brevo API Error:', data);
      console.error('Status:', response.status);
      process.exit(1);
    }

    console.log('✓ Test email sent successfully!');
    console.log('Response:', data);
  } catch (error) {
    console.error('Error sending test email:', error);
    process.exit(1);
  }
}

testEmail();

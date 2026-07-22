export async function sendOrderConfirmationEmail(email, orderNumber, items, total) {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.error('BREVO_API_KEY is not set');
    return false;
  }

  try {
    const itemsList = items.map(item => 
      `<li style="padding: 8px 0; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong> - Size: ${item.size} - Qty: ${item.quantity} - ${formatPrice(item.price)}
      </li>`
    ).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #D4AF37; margin: 0;">MAKHSOOS</h1>
          <p style="color: #666; margin: 5px 0;">Luxury Pakistani Clothing</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Thank You for Your Order!</h2>
          <p style="color: #666;">Your order has been successfully placed.</p>
          <p style="color: #666;"><strong>Order Number:</strong> ${orderNumber}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Order Details</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${itemsList}
          </ul>
        </div>

        <div style="background: #333; color: white; padding: 20px; border-radius: 10px; text-align: right;">
          <p style="margin: 0; font-size: 18px;"><strong>Total: ${formatPrice(total)}</strong></p>
        </div>

        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
          <p>We'll process your order soon and send you shipping updates.</p>
          <p style="margin-top: 10px;">Thank you for choosing MAKHSOOS!</p>
        </div>
      </div>
    `;

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        sender: {
          name: 'MAKHSOOS',
          email: 'makhsoos708@gmail.com'
        },
        to: [{
          email: email
        }],
        subject: `Order Confirmation - ${orderNumber}`,
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Brevo API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendOrderNotificationToOwner(orderNumber, items, total, shippingAddress) {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.error('BREVO_API_KEY is not set');
    return false;
  }

  try {
    const itemsList = items.map(item => 
      `<li style="padding: 8px 0; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong> - Size: ${item.size} - Qty: ${item.quantity} - ${formatPrice(item.price)}
      </li>`
    ).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #D4AF37; margin: 0;">MAKHSOOS</h1>
          <p style="color: #666; margin: 5px 0;">New Order Received</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Order #${orderNumber}</h2>
          <p style="color: #666;">A new order has been placed.</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Customer Information</h3>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 10px;">
            <p style="margin: 5px 0;"><strong>Name:</strong> ${shippingAddress?.name || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${shippingAddress?.email || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${shippingAddress?.phone || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Address:</strong> ${shippingAddress?.address || 'N/A'}, ${shippingAddress?.city || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Postal Code:</strong> ${shippingAddress?.postalCode || 'N/A'}</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Order Details</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${itemsList}
          </ul>
        </div>

        <div style="background: #333; color: white; padding: 20px; border-radius: 10px; text-align: right;">
          <p style="margin: 0; font-size: 18px;"><strong>Total: ${formatPrice(total)}</strong></p>
        </div>

        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
          <p>Please process this order as soon as possible.</p>
        </div>
      </div>
    `;

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        sender: {
          name: 'MAKHSOOS',
          email: 'makhsoos708@gmail.com'
        },
        to: [{
          email: 'makhsoos708@gmail.com'
        }],
        subject: `New Order Received - ${orderNumber}`,
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Brevo API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending owner notification email:', error);
    return false;
  }
}

export async function sendOrderStatusUpdateEmail(email, orderNumber, status) {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.error('BREVO_API_KEY is not set');
    return false;
  }

  const statusMessages = {
    'Confirmed': 'Your order has been confirmed and is being prepared.',
    'Shipped': 'Your order has been shipped and is on its way to you!',
    'Delivered': 'Your order has been delivered. Thank you for shopping with us!',
    'Cancelled': 'Your order has been cancelled. If you have any questions, please contact us.'
  };

  const statusColors = {
    'Confirmed': '#4CAF50',
    'Shipped': '#2196F3',
    'Delivered': '#8BC34A',
    'Cancelled': '#F44336'
  };

  const message = statusMessages[status] || 'Your order status has been updated.';
  const color = statusColors[status] || '#D4AF37';

  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #D4AF37; margin: 0;">MAKHSOOS</h1>
          <p style="color: #666; margin: 5px 0;">Luxury Pakistani Clothing</p>
        </div>
        
        <div style="background: ${color}; color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 24px;">Order Status Update</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Order #${orderNumber}</p>
        </div>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <div style="text-align: center;">
            <p style="font-size: 20px; color: #333; margin: 0;">Status: <strong style="color: ${color};">${status}</strong></p>
            <p style="color: #666; margin-top: 15px;">${message}</p>
          </div>
        </div>

        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
          <p>You can track your order status in your profile.</p>
          <p style="margin-top: 10px;">Thank you for choosing MAKHSOOS!</p>
        </div>
      </div>
    `;

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        sender: {
          name: 'MAKHSOOS',
          email: 'makhsoos708@gmail.com'
        },
        to: [{
          email: email
        }],
        subject: `Order Status Update - ${orderNumber} - ${status}`,
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Brevo API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

function formatPrice(price) {
  return `PKR ${Number(price).toLocaleString('en-PK')}`;
}

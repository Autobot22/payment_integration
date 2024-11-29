const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
const authHeader = `Basic cnpwX3Rlc3RfS3N1ZnYxOHZQUWJMVjI6Q1ROdzlnY1VlZnRPSEd3VTd0a1NyQVVG`;

// Dynamic endpoint for creating a payment link
app.post('/create-payment-link', async (req, res) => {
    const { ticket, reference_id, name, email, contact } = req.body;
    let amountAsInteger = parseInt(ticket, 10);
    if (!amountAsInteger) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    // Prepare the payload with dynamic fields
    const payload = {
      amount: amountAsInteger * 2200, // Razorpay expects amount in paise
      currency: 'INR',
      accept_partial: false,
      first_min_partial_amount: 0,
      expire_by: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
      reference_id: reference_id || `ref_${Date.now()}`, // Default reference ID
      description: 'Payment for policy no #23456(CLICK ON UPI ID and type success@razorpay)',
      customer: {
        name: name || 'N/A', // Default name
        contact: contact || null, // Contact can be null
        email: email || null, // Email can be null
      },
      notify: {
        sms: !!contact, // Notify via SMS if contact is provided
        email: !!email, // Notify via email if email is provided
      },
      reminder_enable: true,
      notes: {
        policy_name: 'Movie booking',
      },
      callback_url: 'https://autobot.zohosites.com/',
      callback_method: 'get',
    };
  
    try {
      const response = await axios.post(
        'https://api.razorpay.com/v1/payment_links',
        payload,
        {
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
        }
      );
  
      // Respond with the payment link and details
      res.status(200).json({
        message: 'Payment link created successfully',
        paymentLink: response.data.short_url,
        id: response.data.id,
      });
    } catch (error) {
      console.error('Error creating payment link:', error.response?.data || error.message);
      res.status(500).json({
        error: 'Failed to create payment link',
        details: error.response?.data || error.message,
      });
    }
  });
  
  // Default route to check server status
  app.get('/', (req, res) => {
    res.status(200).json({ value: 'Server is running' });
  });
  
  // Start the server
  app.listen(5000, () => {
    console.log('Server running on port 5000');
  });
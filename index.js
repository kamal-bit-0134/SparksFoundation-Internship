const express = require('express');
const bodyParser = require('body-parser');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// const { validateWebhookSignature } = require('razorpay-webhook');

const cors = require('cors');
app.use(cors());

const corsOptions = {
  origin: '',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));


// Create a new instance of Razorpay with your key_id and key_secret
const razorpay = new Razorpay({
  key_id: '',
  key_secret: '',
});

// Handle POST request to create an order and send back the order details
app.post('/create_order', (req, res) => {
  console.log('first')
  const options = {
    // amount: req.body.amount * 100,
    amount: req.body.amount * 100,

    currency: 'INR',
    receipt: 'order_rcptid_11',
    payment_capture: 1,
  };
  razorpay.orders.create(options, (err, order) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: 'Something went wrong',
      });
    }
    res.json(order);
  });
});

// Handle POST request to verify the payment and send an email to the customer
app.post('/verify_payment', async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    name,
    email,
    amount,
  } = req.body;

  res.json({status:'ok'})
  try {
   
    const isValidSignature = ()=>{
      console.log(req.body)

      const crypto = require('crypto')

      const shasum = crypto.createHmac('sha256', secret)
      shasum.update(JSON.stringify(req.body))
      const digest = shasum.digest('hex')

      console.log(digest, req.headers['x-razorpay-signature'])

      if (digest === req.headers['x-razorpay-signature']) {
        console.log('request is legit')
        // process it
        require('fs').writeFileSync('payment1.json', JSON.stringify(req.body, null, 4))
      } else {
        // pass it
      }
      res.json({ status: 'ok' })
    }
    if (isValidSignature) {
      // return res.status(400).send('Invalid Signature');
      console.log('Verification done')
    }
    if (!isValidSignature) {
      return res.status(400).send('Invalid Signature');
    }

    // Send an email to the specified email address
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: '',
        
        pass: ''
      },
    });

    const mailOptions = {
      from: '',
      
      to: email,
      subject: 'Payment Successful',
      text: `Dear ${name},\n\nYour payment of INR ${amount} has been received successfully.`,
    };

    await transporter.sendMail(mailOptions);

    // res.send('Payment Successful');
  } catch (error) {
    console.error(error);
    // res.status(500).send('Internal Server Error');
  }
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server started on port 3000');
});

const Stripe = require('stripe');
const express = require('express');
const app = express();
const Starton = require('./Starton');
const router = express.Router();

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = 'YOUR_STRIPE_WEBHOOK_SECRET_KEY';

const STRIPE_KEY = 'YOUR_STRIPE_SECRET_API_KEY';

router.post(
  '/',
  express.raw({ type: 'application/json' }),
  (request, response) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
      event = Stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        // We call our Starton method to mint and send to the user.
        if (!Starton.mintAndSend(paymentIntent))
          return response
            .status(500)
            .send(`NFT Mint Error: No user email or wallet found`);

        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

app.use('/webhook', router);

app.use(express.static(__dirname + '/'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/buy', async (req, res) => {
  // Create metadata for Stripe Buyer
  try {
    const stripe = Stripe(STRIPE_KEY);
    const customer = await stripe.customers.create({
      email: req.body.email,
      metadata: {
        wallet: req.body.wallet,
      },
    });

    if (!customer) {
      return res
        .status(500)
        .send(`Customer Error: Can not create new customer`);
    }
    return res.redirect('https://buy.stripe.com/test_28o16Z9NQ8vTfGUaEE');
  } catch (error) {
    return res
      .status(500)
      .send(`Customer Error: Can not create new customer: Error: ${error}`);
  }
});
app.listen(4242, () => console.log('Running on port 4242'));

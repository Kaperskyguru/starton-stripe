const stripe = require("stripe");
const express = require("express");
const app = express();
const Starton = require("./Starton");
const User = require("./User");

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret =
  "whsec_041bb62a3bd692a16149897ce041c23480020ab808256fe5c8d811271f7a842a";

app.post("/buy", (req, res) => {
  return User.create(req.body);
});

app.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;

        // We call our Starton method to mint and send to the user.
        Starton.mintAndSend(paymentIntent);

        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

app.listen(4242, () => console.log("Running on port 4242"));

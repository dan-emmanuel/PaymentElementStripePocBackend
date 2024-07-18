const express = require('express');
const Stripe = require('stripe');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(bodyParser.json());

app.get('/prices', async (req, res) => {
  try {
    const products = [
      {
        id: "prod_QJGnKoCsAAAssu",
        name: "Veille",
        description: "Veille sur toutes les subventions",
        default_price: "price_1PSeGJIGBjtQnNQPa6JIvamV",
        prices: [
          {
            id: "price_1PSeGJIGBjtQnNQPa6JIvamV",
            unit_amount: 1990,
            currency: "eur"
          }
        ]
      },
      {
        id: "prod_QJGnr20dFpAhwQ",
        name: "Combo",
        description: "Chatbot + Veille",
        default_price: "price_1PSeFlIGBjtQnNQPvEaX56Dh",
        prices: [
          {
            id: "price_1PSeFlIGBjtQnNQPvEaX56Dh",
            unit_amount: 2990,
            currency: "eur"
          }
        ]
      },
      {
        id: "prod_QJGlJkKBFPCysZ",
        name: "Veille",
        description: "Veille sur toutes les subventions/ Segmentation: géographique/secteur d'activité/ type de financeur",
        default_price: "price_1PSeE6IGBjtQnNQP2h6MLv9Z",
        prices: [
          {
            id: "price_1PSeE6IGBjtQnNQP2h6MLv9Z",
            unit_amount: 1990,
            currency: "eur"
          }
        ]
      }
    ];
    res.json(products);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post('/create-customer', async (req, res) => {
  const { email } = req.body;
  try {
    const customer = await stripe.customers.create({
      email,
    });
    res.send({ customerId: customer.id });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency, customerId } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      automatic_payment_methods: { enabled: true },
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post('/create-setup-intent', async (req, res) => {
  const { customerId } = req.body;
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
    });
    res.send({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error('Error creating setup intent:', error);
    res.status(500).send({ error: error.message });
  }
});

app.post('/create-subscription', async (req, res) => {
  const { customerId, priceId, paymentMethodId } = req.body;
  try {
    console.log(`Creating subscription for customerId: ${customerId}, priceId: ${priceId}`);
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
    });
    console.log(`Subscription created: ${subscription.id}`);
    res.send({ subscriptionId: subscription.id });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).send({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
const express = require('express');
const router = express.Router();
const { createPayment, getPayments, getPayment, createPaymentIntent } = require('../controllers/payments');
const { protect } = require('../middleware/auth');
const { validatePayment } = require('../middleware/validate');

router.route('/')
  .get(protect, getPayments)
  .post(protect, validatePayment, createPayment);

router.post('/create-intent', protect, createPaymentIntent);

router.route('/:id')
  .get(protect, getPayment);

module.exports = router;

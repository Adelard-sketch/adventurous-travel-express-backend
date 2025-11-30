// Validation middleware for request data
const validateBooking = (req, res, next) => {
  const { itemType, itemId, startDate } = req.body;

  if (!itemType || !itemId || !startDate) {
    return res.status(400).json({
      success: false,
      error: 'Please provide itemType, itemId, and startDate'
    });
  }

  const validItemTypes = ['Tour', 'Flight', 'Taxi', 'Park'];
  if (!validItemTypes.includes(itemType)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid itemType. Must be one of: Tour, Flight, Taxi, Park'
    });
  }

  next();
};

const validatePayment = (req, res, next) => {
  const { booking, amount, paymentMethod } = req.body;

  if (!booking || !amount || !paymentMethod) {
    return res.status(400).json({
      success: false,
      error: 'Please provide booking, amount, and paymentMethod'
    });
  }

  const validPaymentMethods = ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'cash'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid payment method'
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Amount must be greater than 0'
    });
  }

  next();
};

const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide name, email, and password'
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email'
    });
  }

  // Password validation
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters'
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide email and password'
    });
  }

  next();
};

module.exports = {
  validateBooking,
  validatePayment,
  validateRegistration,
  validateLogin
};

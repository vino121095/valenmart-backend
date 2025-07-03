const { body } = require('express-validator');
 
// Define your validators
const registerValidator = [
    body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/).withMessage('Phone number must be exactly 10 digits'),
  body('password')
  .trim()
  .notEmpty().withMessage('Password is required')
  .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

body('bio')
  .optional()
  .isLength({ max: 500 }).withMessage('Bio must be at most 500 characters long'),
];
 
const loginValidator = [
  body('email').isEmail().withMessage('Invalid email format.'),
  body('password').notEmpty().withMessage('Password is required.'),
];
 
module.exports = { registerValidator, loginValidator };
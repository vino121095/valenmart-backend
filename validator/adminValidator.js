const { body } = require('express-validator');
const { check } = require('express-validator');

const adminValidator = [
    body('username').notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Email is required and must be valid.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
];

const adminLoginValidator = [
    body('email').isEmail().withMessage('Email is required and must be valid.'),
    body('password').exists().withMessage('Password is required.'),
];

const updateProfileValidator = [
    body('username')
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email address')
];

const changePasswordValidator = [
    check('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    check('confirmPassword')
        .notEmpty().withMessage('Confirm password is required')
];

module.exports = {
    adminValidator,
    adminLoginValidator,
    updateProfileValidator,
    changePasswordValidator
};

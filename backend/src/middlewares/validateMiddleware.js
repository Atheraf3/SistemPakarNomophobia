const { validationResult } = require('express-validator');

const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400);

        return res.json({
            success: false,
            message: "Validation Error",
            errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
        });
    };
};

module.exports = validate;

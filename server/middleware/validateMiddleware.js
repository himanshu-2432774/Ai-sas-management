const validateRequiredFields = (fields) => {
    return (req, res, next) => {

        for (const field of fields) {

            if (
                !req.body[field] ||
                typeof req.body[field] !== "string" ||
                req.body[field].trim() === ""
            ) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required`
                });
            }
        }

        next();
    };
};

module.exports = {
    validateRequiredFields
};
const openai = require("../config/openai");

const generateAI = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({
                message: "Prompt is required"
            });
        }

        const response = await openai.responses.create({
            model: "gpt-5.6-luna",
            input: prompt
        });

        res.status(200).json({
            message: "AI response generated successfully",
            response: response.output_text,
            remainingCredits: req.userData.credits
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "AI generation failed",
            error: error.message
        });
    }
};

module.exports = {
    generateAI
};
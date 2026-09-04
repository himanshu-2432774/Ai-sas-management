const generateAI = async (req, res) => {
    try {
        const { prompt } = req.body;

        // Check prompt
        if (!prompt) {
            return res.status(400).json({
                message: "Prompt is required"
            });
        }

        // Fake AI response
        const aiResponse = `
        This is a mock AI response.

        Your prompt was:
        "${prompt}"

        This response is generated locally for testing
        because the real AI API is currently unavailable.
        `;

        // Deduct 1 credit
        req.userData.credits -= 1;
        await req.userData.save();

        res.status(200).json({
            message: "AI response generated successfully",
            response: aiResponse,
            remainingCredits: req.userData.credits
        });

    } catch (error) {
        console.error("AI Error:", error);

        res.status(500).json({
            message: "AI generation failed",
            error: error.message
        });
    }
};


const generateResume = async (req, res) => {
    try {
        const {
            name,
            email,
            skills,
            education,
            experience,
            projects
        } = req.body;

        // Validate required fields
        if (!name || !email || !skills || !education) {
            return res.status(400).json({
                message: "Name, email, skills and education are required"
            });
        }

        // Mock AI Resume
        const resume = {
            name,
            email,
            skills,
            education,
            experience: experience || "Fresher",
            projects: projects || "No projects provided"
        };

        // Deduct 1 credit
        req.userData.credits -= 1;
        await req.userData.save();

        res.status(200).json({
            message: "Resume generated successfully",
            resume,
            remainingCredits: req.userData.credits
        });

    } catch (error) {
        console.error("Resume Error:", error);

        res.status(500).json({
            message: "Resume generation failed",
            error: error.message
        });
    }
};
module.exports = {
    generateAI
};
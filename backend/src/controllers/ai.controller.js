import main from "../utils/geminiUtility.js";

export const getAIResponse = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Files uploaded:', req.files?.length || 0);
    
    const { prompt } = req.body;
    if (!prompt) {  
        return res.status(400).json({ error: 'Prompt is required' });
    }

    // Get image paths if files were uploaded
    const imagePaths = req.files ? req.files.map(file => file.path) : [];
    
    // Add context if images are present
    let enhancedPrompt = prompt;
    if (imagePaths.length > 0) {
      enhancedPrompt = `${prompt}\n\n[User has uploaded ${imagePaths.length} image(s) - please analyze them carefully and provide detailed insights about what you see, especially if they are medical documents, prescriptions, lab reports, or symptoms.]`;
    }

    const aiResponse = await main(enhancedPrompt, imagePaths);
    res.json({ success: true, response: aiResponse });
  } catch (error) {
    console.error('Error generating AI response:', error);
    res.status(500).json({ success: false, error: error.message } );
  }
};


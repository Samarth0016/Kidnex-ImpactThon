import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get Gemini model instance
 * @param {string} modelName - Model name (default: gemini-2.0-flash)
 * @returns {object} - Gemini model instance
 */
export const getGeminiModel = (modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash') => {
  return genAI.getGenerativeModel({ model: modelName });
};

/**
 * Fallback response when Gemini API is unavailable
 * @param {string} userMessage - User's message
 * @returns {string} - Fallback response
 */
const getFallbackResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Simple keyword-based responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm your AI health assistant. I'm currently experiencing connectivity issues with my AI service, but I'm here to help. Please try asking your question again in a moment, or consult with a healthcare professional for urgent matters.";
  }
  
  if (lowerMessage.includes('symptom') || lowerMessage.includes('pain') || lowerMessage.includes('sick')) {
    return "I understand you're experiencing health concerns. I'm currently having trouble connecting to my AI service. For any symptoms or health issues, I strongly recommend:\n\n1. Consult with a qualified healthcare professional\n2. Call your doctor or visit a clinic\n3. For emergencies, call emergency services immediately\n\nPlease try again in a moment for AI-powered guidance.";
  }
  
  if (lowerMessage.includes('diet') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
    return "For personalized dietary advice, I recommend:\n\n1. Consult with a registered dietitian or nutritionist\n2. Maintain a balanced diet with fruits, vegetables, whole grains, and lean proteins\n3. Stay hydrated by drinking plenty of water\n4. Limit processed foods and added sugars\n\n*Note: I'm currently experiencing connectivity issues. Please try again later for AI-powered personalized advice.*";
  }
  
  if (lowerMessage.includes('exercise') || lowerMessage.includes('workout') || lowerMessage.includes('fitness')) {
    return "Exercise is important for overall health! General recommendations:\n\n1. Aim for 150 minutes of moderate aerobic activity per week\n2. Include strength training 2-3 times per week\n3. Always warm up before and cool down after exercise\n4. Listen to your body and avoid overexertion\n\n*Note: I'm currently experiencing connectivity issues. Please consult with a fitness professional for personalized plans.*";
  }
  
  // Default fallback
  return "Thank you for your message. I'm currently experiencing connectivity issues with my AI service and cannot provide a detailed response right now. \n\n**For health concerns:**\n- Please consult with a qualified healthcare professional\n- For emergencies, contact emergency services immediately\n\n**General health tips:**\n- Maintain a balanced diet\n- Exercise regularly\n- Get adequate sleep (7-9 hours)\n- Stay hydrated\n- Manage stress\n\nPlease try again in a moment, and I'll be able to provide more personalized guidance. 🏥";
};

/**
 * Generate health suggestions based on detection results
 * @param {object} detectionData - Detection result data
 * @param {object} userProfile - User profile data
 * @returns {Promise<string>} - AI-generated suggestions
 */
export const generateHealthSuggestions = async (detectionData, userProfile) => {
  try {
    const model = getGeminiModel();

    const prompt = `
You are an expert medical AI assistant. Based on the following medical scan result and patient profile, provide personalized health recommendations.

**Scan Result:**
- Detection Type: ${detectionData.detectionType}
- Prediction: ${detectionData.prediction}
- Confidence: ${(detectionData.confidence * 100).toFixed(2)}%
- Risk Level: ${detectionData.riskLevel || 'Not assessed'}

**Patient Profile:**
- Age: ${userProfile.age} years
- Gender: ${userProfile.gender}
- BMI: ${userProfile.bmi?.toFixed(1) || 'Not available'}
- Medical History: ${userProfile.medicalHistory ? JSON.stringify(userProfile.medicalHistory) : 'None provided'}

**Instructions:**
Provide a comprehensive, personalized health recommendation including:

1. **Immediate Actions:** What should the patient do right now?
2. **Lifestyle Modifications:** Diet, exercise, sleep recommendations
3. **Precautions:** Things to avoid or be careful about
4. **Follow-up:** When to consult a doctor and what tests to consider
5. **Positive Reinforcement:** Encouraging words (if applicable)

Keep the tone professional, empathetic, and clear. Use bullet points and clear sections.
Format the response in markdown for better readability.

⚠️ **Important:** Always include a disclaimer that this is AI-generated advice and not a replacement for professional medical consultation.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error.message || error);
    
    // Return a basic fallback suggestion
    return `
## Health Recommendations

**⚠️ Note:** Our AI service is currently experiencing connectivity issues. Below are general recommendations:

### Immediate Actions:
- Consult with a qualified healthcare professional about your scan results
- Share your scan report with your doctor
- Do not ignore any symptoms

### Lifestyle Modifications:
- **Diet:** Focus on kidney-friendly foods (low sodium, moderate protein)
- **Hydration:** Drink adequate water (consult your doctor for specific amounts)
- **Exercise:** Engage in moderate physical activity as recommended by your doctor
- **Sleep:** Aim for 7-9 hours of quality sleep

### Precautions:
- Avoid self-medication
- Monitor your symptoms regularly
- Follow your doctor's prescribed treatment plan
- Avoid excessive alcohol and smoking

### Follow-up:
- Schedule an appointment with a nephrologist or urologist
- Discuss additional tests if recommended
- Regular monitoring is essential

**⚠️ Disclaimer:** This is general health information. Always consult healthcare professionals for medical advice specific to your condition.
`;
  }
};

/**
 * Generate chat response with user context
 * @param {string} userMessage - User's message
 * @param {object} userContext - User profile and history
 * @param {array} conversationHistory - Previous conversation
 * @returns {Promise<string>} - AI response
 */
export const generateChatResponse = async (userMessage, userContext, conversationHistory = []) => {
  try {
    // Validate API key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
      console.error('❌ GEMINI_API_KEY not configured properly');
      return getFallbackResponse(userMessage);
    }

    const model = getGeminiModel();

    // Build context prompt
    let contextPrompt = `
You are a compassionate and knowledgeable AI health assistant. You have access to the user's profile and medical history.

**User Context:**
- Name: ${userContext.profile?.firstName} ${userContext.profile?.lastName}
- Age: ${userContext.profile?.age} years
- Gender: ${userContext.profile?.gender}
- BMI: ${userContext.profile?.bmi?.toFixed(1) || 'Not available'}
- Health Goal: ${userContext.profile?.healthGoal || 'General wellness'}
`;

    if (userContext.medicalHistory) {
      contextPrompt += `\n**Medical History:**\n${JSON.stringify(userContext.medicalHistory, null, 2)}`;
    }

    if (userContext.recentDetections && userContext.recentDetections.length > 0) {
      contextPrompt += `\n**Recent Detections:**\n${JSON.stringify(userContext.recentDetections, null, 2)}`;
    }

    contextPrompt += `\n\n**Conversation History:**\n`;
    conversationHistory.slice(-5).forEach(msg => {
      contextPrompt += `${msg.role === 'USER' ? 'User' : 'Assistant'}: ${msg.message}\n`;
    });

    contextPrompt += `\n**Current User Message:** ${userMessage}\n\n`;
    contextPrompt += `
**Instructions:**
- Provide helpful, accurate, and personalized health advice
- Be empathetic and supportive
- If asked about symptoms, provide general guidance but always recommend consulting a doctor
- Never provide definitive diagnoses
- Keep responses concise and actionable
- Use markdown formatting for better readability

**Important:** Always remind users that you're an AI assistant and recommend consulting healthcare professionals for serious concerns.
`;

    const result = await model.generateContent(contextPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini Chat Error:', error.message || error);
    
    // Check for specific error types
    if (error.message?.includes('fetch failed') || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('❌ Network error connecting to Gemini API. Check your internet connection or firewall settings.');
      return getFallbackResponse(userMessage);
    }
    
    if (error.message?.includes('API key')) {
      console.error('❌ Invalid Gemini API key');
      return getFallbackResponse(userMessage);
    }
    
    // Return fallback response instead of throwing
    return getFallbackResponse(userMessage);
  }
};

/**
 * Calculate health risk score
 * @param {object} userData - Complete user data
 * @returns {Promise<object>} - Risk score and analysis
 */
export const calculateHealthRiskScore = async (userData) => {
  try {
    const model = getGeminiModel();

    const prompt = `
You are a health risk assessment AI. Calculate a comprehensive health risk score (0-100) based on the following data:

**User Profile:**
${JSON.stringify(userData, null, 2)}

**Instructions:**
1. Analyze all health factors (BMI, age, medical history, lifestyle, recent detections)
2. Calculate a risk score from 0 (excellent health) to 100 (critical risk)
3. Provide a breakdown of risk factors
4. Suggest areas for improvement

Respond in JSON format:
{
  "riskScore": <number 0-100>,
  "riskLevel": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "factors": [
    { "factor": "BMI", "impact": "HIGH/MEDIUM/LOW", "description": "..." },
    ...
  ],
  "recommendations": ["...", "..."]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse risk assessment');
  } catch (error) {
    console.error('Risk Assessment Error:', error);
    throw new Error('Failed to calculate health risk score');
  }
};

export default {
  getGeminiModel,
  generateHealthSuggestions,
  generateChatResponse,
  calculateHealthRiskScore,
};

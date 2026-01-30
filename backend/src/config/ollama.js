import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Ollama API Configuration
// Default to localhost for local Ollama instance
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/api';
// Default model to 'llama3' or 'mistral', but can be configured
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1';

/**
 * Check if Ollama is configured (always true for local default, but good for structure)
 */
export const isOllamaConfigured = () => {
  return true; // Assumes local Ollama is available if user selects it
};

/**
 * Generate completion using Ollama API
 * @param {array} messages - Array of message objects with role and content
 * @param {object} options - Additional options
 * @returns {Promise<string>} - AI response text
 */
export const generateOllamaCompletion = async (messages, options = {}) => {
  try {
    console.log(`🦙 Calling Ollama with model: ${OLLAMA_MODEL}`);

    // Ollama chat endpoint expects 'model' and 'messages'
    // It's not exactly OpenAI compatible by default unless checking specific endpoints, 
    // but the /api/chat endpoint is standard for Ollama.
    const response = await axios.post(`${OLLAMA_BASE_URL}/chat`, {
      model: OLLAMA_MODEL,
      messages: messages,
      stream: false, // Turn off streaming for simpler integration first
      options: {
        temperature: options.temperature || 0.7,
        // num_predict is Ollama's max_tokens
        num_predict: options.max_tokens || 2048, 
        top_p: options.top_p || 0.9,
      }
    });

    if (response.data && response.data.message) {
      return response.data.message.content;
    } else {
      throw new Error('Invalid response format from Ollama');
    }
  } catch (error) {
    console.error('Ollama API Error:', error.response?.data || error.message);
    if (error.code === 'ECONNREFUSED') {
       throw new Error('Ollama service not reachable. Is it running? (run `ollama serve`)');
    }
    throw error;
  }
};

// Alias for backward compatibility
export const generateOllamaResponse = generateOllamaCompletion;

/**
 * Fallback response when Ollama is unavailable
 */
const getFallbackResponse = (userMessage, errorMsg) => {
  return `I apologize, but I couldn't connect to the local Ollama service. 

**Error details:** ${errorMsg || 'Connection failed'}

**Troubleshooting:**
1. Make sure Ollama is installed.
2. Run \`ollama serve\` in your terminal.
3. Ensure you have the model installed (e.g., \`ollama pull ${OLLAMA_MODEL}\`).

You can switch to Gemini or BioMistral in the meantime.`;
};

/**
 * Generate health suggestions based on detection results using Ollama
 */
export const generateOllamaHealthSuggestions = async (detectionData, userProfile) => {
  try {
    const systemPrompt = `You are a specialized medical AI assistant.
Your role is to:
- Analyze medical scan results with clinical precision
- Provide evidence-based health recommendations
- Consider patient demographics and medical history
- Offer actionable, personalized advice
- Always emphasize the importance of professional medical consultation

Format responses in clear markdown.`;

    const userPrompt = `Based on the following medical scan result and patient profile, provide personalized health recommendations.

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

**Provide:**
1. **Immediate Actions**
2. **Lifestyle Modifications**
3. **Precautions**
4. **Follow-up**

⚠️ **Important:** Include a disclaimer that this is AI-generated advice.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    return await generateOllamaCompletion(messages);
  } catch (error) {
    console.error('Ollama Health Suggestions Error:', error);
    return `
## Health Recommendations
**⚠️ Note:** Local Ollama service is unavailable.
Please consult a healthcare professional.
`;
  }
};

/**
 * Generate chat response with user context using Ollama
 */
export const generateOllamaChatResponse = async (userMessage, userContext, conversationHistory = []) => {
  try {
    const systemPrompt = `You are a compassionate and knowledgeable AI health assistant.
**User Context:**
- Name: ${userContext.profile?.firstName} ${userContext.profile?.lastName}
- Age: ${userContext.profile?.age} years
- Gender: ${userContext.profile?.gender}
${userContext.medicalHistory ? `\n**Medical History:**\n${JSON.stringify(userContext.medicalHistory, null, 2)}` : ''}
${userContext.recentDetections?.length > 0 ? `\n**Recent Detections:**\n${JSON.stringify(userContext.recentDetections, null, 2)}` : ''}

**Instructions:**
- Provide helpful, accurate, and personalized health advice
- Be empathetic and supportive
- Never provide definitive diagnoses
- Keep responses concise and actionable
- Use markdown formatting
- Always remind users that you're an AI assistant and recommend consulting healthcare professionals.`;

    const messages = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history
    conversationHistory.slice(-5).forEach(msg => {
      messages.push({
        role: msg.role === 'USER' ? 'user' : 'assistant',
        content: msg.message,
      });
    });

    messages.push({ role: 'user', content: userMessage });

    return await generateOllamaCompletion(messages);
  } catch (error) {
    console.error('Ollama Chat Error:', error);
    return getFallbackResponse(userMessage, error.message);
  }
};

export default {
  generateOllamaHealthSuggestions,
  generateOllamaChatResponse,
  generateOllamaCompletion,
  generateOllamaResponse,
  isOllamaConfigured,
};

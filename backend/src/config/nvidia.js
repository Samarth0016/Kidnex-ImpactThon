import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// NVIDIA NIM API Configuration
// Using Mistral-7B-Instruct which is actually available on NVIDIA NIM
// Note: BioMistral-7B-DARE is NOT available as a hosted API anywhere
const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'mistralai/mistral-7b-instruct-v0.2';

/**
 * Create NVIDIA NIM API client (OpenAI-compatible)
 */
const nvidiaClient = axios.create({
  baseURL: NVIDIA_BASE_URL,
  headers: {
    'Authorization': `Bearer ${NVIDIA_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Generate completion using NVIDIA NIM API (OpenAI-compatible format)
 * @param {array} messages - Array of message objects with role and content
 * @param {object} options - Additional options
 * @returns {Promise<string>} - AI response text
 */
const generateNvidiaCompletion = async (messages, options = {}) => {
  try {
    if (!NVIDIA_API_KEY || NVIDIA_API_KEY === 'your-nvidia-api-key-here') {
      throw new Error('NVIDIA_API_KEY not configured');
    }

    console.log(`🤖 Calling NVIDIA NIM with model: ${NVIDIA_MODEL}`);

    const response = await nvidiaClient.post('/chat/completions', {
      model: NVIDIA_MODEL,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 2048,
      top_p: options.top_p || 0.9,
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('NVIDIA API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fallback response when NVIDIA API is unavailable
 */
const getFallbackResponse = (userMessage) => {
  return `I apologize, but I'm currently experiencing connectivity issues with the NVIDIA AI service. 

**For health concerns:**
- Please consult with a qualified healthcare professional
- For emergencies, contact emergency services immediately

**General health tips:**
- Maintain a balanced diet
- Exercise regularly
- Get adequate sleep (7-9 hours)
- Stay hydrated
- Manage stress

Please try again in a moment, or switch to Gemini AI for immediate assistance. 🏥`;
};

/**
 * Generate health suggestions based on detection results using NVIDIA
 */
export const generateNvidiaHealthSuggestions = async (detectionData, userProfile) => {
  try {
    // Medical-focused system prompt (emulating BioMistral's medical training)
    const systemPrompt = `You are a specialized medical AI assistant with expertise in radiology, kidney health, and clinical recommendations. You have been trained on medical literature including PubMed Central research papers.

Your role is to:
- Analyze medical scan results with clinical precision
- Provide evidence-based health recommendations
- Consider patient demographics and medical history
- Offer actionable, personalized advice
- Always emphasize the importance of professional medical consultation

Format responses in clear markdown with appropriate medical terminology.`;

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
1. **Immediate Actions:** What should the patient do right now?
2. **Lifestyle Modifications:** Diet, exercise, sleep recommendations
3. **Precautions:** Things to avoid or be careful about
4. **Follow-up:** When to consult a doctor and what tests to consider
5. **Positive Reinforcement:** Encouraging words (if applicable)

⚠️ **Important:** Include a disclaimer that this is AI-generated advice and not a replacement for professional medical consultation.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    return await generateNvidiaCompletion(messages);
  } catch (error) {
    console.error('NVIDIA Health Suggestions Error:', error);
    
    return `
## Health Recommendations

**⚠️ Note:** NVIDIA AI service is currently unavailable. Below are general recommendations:

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

### Follow-up:
- Schedule an appointment with a nephrologist or urologist
- Discuss additional tests if recommended

**⚠️ Disclaimer:** This is general health information. Always consult healthcare professionals for medical advice specific to your condition.
`;
  }
};

/**
 * Generate chat response with user context using NVIDIA
 */
export const generateNvidiaChatResponse = async (userMessage, userContext, conversationHistory = []) => {
  try {
    if (!NVIDIA_API_KEY || NVIDIA_API_KEY === 'your-nvidia-api-key-here') {
      console.error('❌ NVIDIA_API_KEY not configured properly');
      return getFallbackResponse(userMessage);
    }

    // Medical-focused system prompt
    const systemPrompt = `You are a compassionate and knowledgeable AI health assistant powered by Mistral AI. You specialize in medical guidance and have knowledge equivalent to medical literature including PubMed research.

**User Context:**
- Name: ${userContext.profile?.firstName} ${userContext.profile?.lastName}
- Age: ${userContext.profile?.age} years
- Gender: ${userContext.profile?.gender}
- BMI: ${userContext.profile?.bmi?.toFixed(1) || 'Not available'}
- Health Goal: ${userContext.profile?.healthGoal || 'General wellness'}
${userContext.medicalHistory ? `\n**Medical History:**\n${JSON.stringify(userContext.medicalHistory, null, 2)}` : ''}
${userContext.recentDetections?.length > 0 ? `\n**Recent Detections:**\n${JSON.stringify(userContext.recentDetections, null, 2)}` : ''}

**Instructions:**
- Provide helpful, accurate, and personalized health advice
- Be empathetic and supportive
- If asked about symptoms, provide general guidance but always recommend consulting a doctor
- Never provide definitive diagnoses
- Keep responses concise and actionable
- Use markdown formatting for better readability
- Always remind users that you're an AI assistant and recommend consulting healthcare professionals for serious concerns.`;

    const messages = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history (last 5 messages)
    conversationHistory.slice(-5).forEach(msg => {
      messages.push({
        role: msg.role === 'USER' ? 'user' : 'assistant',
        content: msg.message,
      });
    });

    messages.push({ role: 'user', content: userMessage });

    return await generateNvidiaCompletion(messages);
  } catch (error) {
    console.error('NVIDIA Chat Error:', error);
    return getFallbackResponse(userMessage);
  }
};

/**
 * Check if NVIDIA API is configured
 */
export const isNvidiaConfigured = () => {
  return NVIDIA_API_KEY && NVIDIA_API_KEY !== 'your-nvidia-api-key-here';
};

export default {
  generateNvidiaHealthSuggestions,
  generateNvidiaChatResponse,
  isNvidiaConfigured,
};

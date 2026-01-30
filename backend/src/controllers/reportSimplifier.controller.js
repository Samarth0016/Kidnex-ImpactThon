import { getGeminiModel } from '../config/gemini.js';
import { generateOllamaResponse } from '../config/ollama.js';
import prisma from '../config/database.js';
import { v2 as cloudinary } from 'cloudinary';
import pdf from 'pdf-parse';

/**
 * Directly analyze and simplify medical report IMAGE using Gemini Vision
 * This is much more powerful than OCR + text analysis - Gemini sees the full context
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} mimeType - Image MIME type
 * @param {object} userProfile - User profile for personalization
 * @returns {Promise<{extractedText: string, simplifiedReport: string}>}
 */
const analyzeImageDirectly = async (imageBuffer, mimeType, userProfile) => {
  try {
    console.log('🔍 Analyzing medical report image directly with Gemini Vision...');
    
    const model = getGeminiModel('gemini-2.5-flash');
    
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');
    
    const prompt = `You are an expert medical report analyzer. Analyze this medical report image thoroughly.

**Patient Profile:**
- Age: ${userProfile?.age || 'Not provided'} years
- Gender: ${userProfile?.gender || 'Not provided'}
- Health Goal: ${userProfile?.healthGoal || 'General wellness'}

**Your Task:**
1. First, read and understand ALL text, numbers, values, and information visible in this medical report image.
2. Then, provide a comprehensive yet simple explanation for the patient.

**Structure your response EXACTLY as follows:**

---EXTRACTED_TEXT_START---
[Write out all the text, values, test names, results, dates, and any other information you can see in the image. Be thorough - capture everything.]
---EXTRACTED_TEXT_END---

---SIMPLIFIED_REPORT_START---

## 📋 Report Summary
Provide a brief overview of what this report is about (2-3 sentences).

## 🔬 Key Findings
List the main findings in simple terms:
- Use bullet points
- Explain medical terms in parentheses
- Highlight what's normal vs. what needs attention

## 📊 Test Results Explained
For each test/value you can see:
- What it measures (in simple terms)
- The actual value from the report
- What it means for the patient
- Status: ✅ Normal | ⚠️ Borderline | ❌ Abnormal

## ⚠️ Areas of Concern
List any findings that may need attention:
- Explain why it's a concern
- What it could indicate
- Severity level (Low/Medium/High)

If everything looks normal, say so reassuringly!

## 💡 Recommendations
Based on the report:
- Suggested next steps
- Lifestyle modifications if applicable
- When to follow up with a doctor

## ❓ Questions to Ask Your Doctor
Provide 3-5 relevant questions the patient might want to ask their healthcare provider.

## 📖 Medical Terms Glossary
Define any complex medical terms from the report in simple language.

⚠️ **Disclaimer:** This is an AI-generated interpretation for educational purposes only. Always consult with your healthcare provider for proper medical advice and interpretation.

---SIMPLIFIED_REPORT_END---

**Important:** 
- Be thorough in reading the image - capture ALL visible information
- Use simple, everyday language in the explanation
- Be encouraging but honest about findings
- If something is unclear or illegible, mention it`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      },
    ]);
    
    const response = await result.response;
    const fullResponse = response.text();
    
    // Parse the response to separate extracted text and simplified report
    let extractedText = '';
    let simplifiedReport = '';
    
    const extractedMatch = fullResponse.match(/---EXTRACTED_TEXT_START---([\s\S]*?)---EXTRACTED_TEXT_END---/);
    const simplifiedMatch = fullResponse.match(/---SIMPLIFIED_REPORT_START---([\s\S]*?)---SIMPLIFIED_REPORT_END---/);
    
    if (extractedMatch) {
      extractedText = extractedMatch[1].trim();
    }
    
    if (simplifiedMatch) {
      simplifiedReport = simplifiedMatch[1].trim();
    } else {
      // If parsing fails, use the whole response as simplified report
      simplifiedReport = fullResponse;
    }
    
    // If no extracted text found, generate a placeholder
    if (!extractedText) {
      extractedText = '[Text extracted and analyzed directly from image by AI]';
    }
    
    console.log('✅ Image analysis complete');
    return { extractedText, simplifiedReport };
  } catch (error) {
    console.error('❌ Image Analysis Error:', error.message);
    throw new Error('Failed to analyze the medical report image. Please try again or upload a clearer image.');
  }
};

/**
 * Extract text from PDF
 * @param {Buffer} pdfBuffer - PDF buffer
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromPDF = async (pdfBuffer) => {
  try {
    console.log('📄 Starting PDF text extraction...');
    const data = await pdf(pdfBuffer);
    console.log('✅ PDF extraction complete');
    return data.text.trim();
  } catch (error) {
    console.error('❌ PDF Extraction Error:', error.message);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Generate simplified explanation using Gemini
 * @param {string} reportText - Extracted report text
 * @param {object} userProfile - User profile for personalization
 * @returns {Promise<string>} - Simplified explanation
 */
const simplifyWithGemini = async (reportText, userProfile) => {
  try {
    const model = getGeminiModel();

    const prompt = `
You are an expert medical translator who specializes in converting complex medical reports into simple, easy-to-understand language for patients.

**Patient Profile:**
- Age: ${userProfile?.age || 'Not provided'} years
- Gender: ${userProfile?.gender || 'Not provided'}
- Health Goal: ${userProfile?.healthGoal || 'General wellness'}

**Medical Report Text:**
${reportText}

**Instructions:**
Please analyze this medical report and provide a comprehensive yet simple explanation. Structure your response as follows:

## 📋 Report Summary
Provide a brief overview of what this report is about (2-3 sentences).

## 🔬 Key Findings
List the main findings in simple terms:
- Use bullet points
- Explain medical terms in parentheses
- Highlight what's normal vs. what needs attention

## 📊 Test Results Explained
For each test mentioned:
- What it measures (in simple terms)
- What the result means
- Whether it's within normal range (✅ Normal, ⚠️ Borderline, ❌ Abnormal)

## ⚠️ Areas of Concern
List any findings that may need attention:
- Explain why it's a concern
- What it could indicate
- Severity level (Low/Medium/High)

## 💡 Recommendations
Based on the report:
- Suggested next steps
- Lifestyle modifications if applicable
- When to follow up with a doctor

## ❓ Questions to Ask Your Doctor
Provide 3-5 relevant questions the patient might want to ask their healthcare provider.

## 📖 Medical Terms Glossary
Define any complex medical terms used in the report in simple language.

**Important Guidelines:**
- Use simple, everyday language (avoid jargon)
- Be encouraging but honest
- Always emphasize that this is an AI interpretation and not a substitute for professional medical advice
- If something is unclear in the report, mention it
- Use emojis sparingly to make the content more approachable

⚠️ **Disclaimer:** This is an AI-generated simplification for educational purposes only. Always consult with your healthcare provider for proper medical interpretation and advice.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini Simplification Error:', error.message);
    throw new Error('Failed to simplify report with Gemini AI');
  }
};

/**
 * Generate simplified explanation using Ollama (Local LLM)
 * @param {string} reportText - Extracted report text
 * @param {object} userProfile - User profile for personalization
 * @returns {Promise<string>} - Simplified explanation
 */
const simplifyWithOllama = async (reportText, userProfile) => {
  try {
    const messages = [
      {
        role: 'system',
        content: `You are an expert medical translator who converts complex medical reports into simple, patient-friendly explanations. Always structure your response with clear sections: Summary, Key Findings, Test Results, Areas of Concern, Recommendations, Questions for Doctor, and Glossary. Use simple language and include a disclaimer about consulting healthcare professionals.`
      },
      {
        role: 'user',
        content: `Please simplify this medical report for a ${userProfile?.age || 'adult'} year old ${userProfile?.gender || 'patient'}:

${reportText}

Provide a comprehensive yet easy-to-understand explanation with clear sections and bullet points.`
      }
    ];

    const response = await generateOllamaResponse(messages);
    return response;
  } catch (error) {
    console.error('Ollama Simplification Error:', error.message);
    throw new Error('Failed to simplify report with local LLM');
  }
};

/**
 * Upload and simplify medical report
 */
export const simplifyReport = async (req, res) => {
  try {
    const { aiModel = 'gemini' } = req.body;
    const file = req.file;
    const userId = req.user.id;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload an image or PDF.',
      });
    }

    console.log(`📤 Processing ${file.mimetype} file: ${file.originalname}`);

    // Get user profile for personalization
    const userProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    let extractedText = '';
    let simplifiedReport = '';
    let uploadedUrl = null;

    if (file.mimetype === 'application/pdf') {
      // For PDFs: Extract text first, then simplify
      extractedText = await extractTextFromPDF(file.buffer);
      
      if (!extractedText || extractedText.length < 20) {
        return res.status(400).json({
          success: false,
          message: 'Could not extract sufficient text from the PDF. Please ensure the document contains readable text.',
          extractedText: extractedText || 'No text found',
        });
      }
      
      // Simplify using selected AI model
      if (aiModel === 'ollama') {
        simplifiedReport = await simplifyWithOllama(extractedText, userProfile);
      } else {
        simplifiedReport = await simplifyWithGemini(extractedText, userProfile);
      }
      
    } else if (file.mimetype.startsWith('image/')) {
      // Upload image to Cloudinary for storage
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'medical-reports',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
      
      uploadedUrl = uploadResult.secure_url;
      
      // For images: Use direct Gemini Vision analysis (much more powerful!)
      // This analyzes the image directly without separate OCR step
      if (aiModel === 'gemini') {
        const result = await analyzeImageDirectly(file.buffer, file.mimetype, userProfile);
        extractedText = result.extractedText;
        simplifiedReport = result.simplifiedReport;
      } else {
        // For Ollama, we need to extract text first (Ollama can't see images)
        // Use Gemini for extraction, then Ollama for simplification
        const result = await analyzeImageDirectly(file.buffer, file.mimetype, userProfile);
        extractedText = result.extractedText;
        simplifiedReport = await simplifyWithOllama(extractedText, userProfile);
      }
      
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported file type. Please upload an image or PDF.',
      });
    }

    console.log(`📝 Processed report successfully`);

    // Save to database
    const savedReport = await prisma.simplifiedReport.create({
      data: {
        userId,
        originalFileName: file.originalname,
        fileType: file.mimetype,
        imageUrl: uploadedUrl,
        extractedText,
        simplifiedExplanation: simplifiedReport,
        aiModel,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Report simplified successfully',
      data: {
        id: savedReport.id,
        originalFileName: savedReport.originalFileName,
        fileType: savedReport.fileType,
        imageUrl: savedReport.imageUrl,
        extractedText: extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : ''),
        simplifiedExplanation: simplifiedReport,
        aiModel,
        createdAt: savedReport.createdAt,
      },
    });
  } catch (error) {
    console.error('Report Simplification Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process medical report',
    });
  }
};

/**
 * Get user's simplified report history
 */
export const getReportHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, total] = await Promise.all([
      prisma.simplifiedReport.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          originalFileName: true,
          fileType: true,
          imageUrl: true,
          simplifiedExplanation: true,
          aiModel: true,
          createdAt: true,
        },
      }),
      prisma.simplifiedReport.count({ where: { userId } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        reports,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get Report History Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report history',
    });
  }
};

/**
 * Get single report by ID
 */
export const getReportById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const report = await prisma.simplifiedReport.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Get Report Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
    });
  }
};

/**
 * Delete a simplified report
 */
export const deleteReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const report = await prisma.simplifiedReport.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    await prisma.simplifiedReport.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Delete Report Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
    });
  }
};

export default {
  simplifyReport,
  getReportHistory,
  getReportById,
  deleteReport,
};

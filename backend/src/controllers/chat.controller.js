import prisma from '../config/database.js';
import { generateChatResponse } from '../config/gemini.js';
import { generateNvidiaChatResponse, isNvidiaConfigured } from '../config/nvidia.js';
import { generateOllamaChatResponse, isOllamaConfigured } from '../config/ollama.js';

/**
 * @desc    Send message to AI chatbot
 * @route   POST /api/chat/message
 * @access  Private
 */
export const sendMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { message, model = 'gemini' } = req.body;

    console.log(`💬 Chat message from user: ${userId}, Model: ${model}`);

    // Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        userId,
        role: 'USER',
        message,
      },
    });

    // Get user context (profile, medical history, recent detections)
    const userContext = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        medicalHistory: true,
        detectionHistory: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });

    // Get recent conversation history
    const conversationHistory = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Format context for AI
    const context = {
      profile: userContext.profile,
      medicalHistory: userContext.medicalHistory,
      recentDetections: userContext.detectionHistory.map(d => ({
        type: d.detectionType,
        prediction: d.prediction,
        confidence: d.confidence,
        date: d.createdAt,
      })),
    };

    // Generate AI response based on selected model
    console.log(`🤖 Generating AI response using ${model}...`);
    let aiResponseText;
    
    if (model === 'nvidia' && isNvidiaConfigured()) {
      aiResponseText = await generateNvidiaChatResponse(
        message,
        context,
        conversationHistory.reverse()
      );
    } else if (model === 'ollama' && isOllamaConfigured()) {
      aiResponseText = await generateOllamaChatResponse(
        message,
        context,
        conversationHistory.reverse()
      );
    } else {
      // Default to Gemini
      aiResponseText = await generateChatResponse(
        message,
        context,
        conversationHistory.reverse()
      );
    }

    // Save AI response
    const aiMessage = await prisma.chatMessage.create({
      data: {
        userId,
        role: 'ASSISTANT',
        message: aiResponseText,
        context,
      },
    });

    console.log(`✅ AI response generated using ${model}`);

    res.status(200).json({
      success: true,
      data: {
        userMessage,
        aiMessage: {
          id: aiMessage.id,
          message: aiMessage.message,
          createdAt: aiMessage.createdAt,
          model: model,
        },
      },
    });
  } catch (error) {
    console.error('❌ Chat error:', error);
    next(error);
  }
};

/**
 * @desc    Get chat history
 * @route   GET /api/chat/history
 * @access  Private
 */
export const getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
        select: {
          id: true,
          role: true,
          message: true,
          createdAt: true,
        },
      }),
      prisma.chatMessage.count({ where: { userId } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: total > parseInt(offset) + parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear chat history
 * @route   DELETE /api/chat/history
 * @access  Private
 */
export const clearChatHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await prisma.chatMessage.deleteMany({
      where: { userId },
    });

    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  sendMessage,
  getChatHistory,
  clearChatHistory,
};

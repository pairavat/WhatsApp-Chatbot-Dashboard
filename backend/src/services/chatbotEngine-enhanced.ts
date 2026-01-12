// Enhanced chatbot engine with module-based routing and improved department mapping
import Company from '../models/Company';
import Grievance from '../models/Grievance';
import { GrievanceStatus } from '../config/constants';
import { sendWhatsAppMessage, sendWhatsAppButtons } from './whatsappService';
import { sendOTP, verifyOTP, isPhoneVerified } from './otpService';
import { findDepartmentByCategory, getAvailableCategories } from './departmentMapper';

export interface ChatbotMessage {
  companyId: string;
  from: string;
  messageText: string;
  messageType: string;
  messageId: string;
  mediaUrl?: string;
  metadata?: any;
  buttonId?: string;
}

interface UserSession {
  companyId: string;
  phoneNumber: string;
  language: 'en' | 'hi' | 'mr';
  step: string;
  data: Record<string, any>;
  pendingAction?: string;
  lastActivity: Date;
}

const userSessions: Map<string, UserSession> = new Map();

// Helper to get or create session
function getSession(phoneNumber: string, companyId: string): UserSession {
  let session = userSessions.get(phoneNumber);
  if (!session) {
    session = {
      companyId,
      phoneNumber,
      language: 'en',
      step: 'start',
      data: {},
      lastActivity: new Date()
    };
    userSessions.set(phoneNumber, session);
  }
  session.lastActivity = new Date();
  return session;
}

async function updateSession(session: UserSession) {
  userSessions.set(session.phoneNumber, session);
}

async function clearSession(phoneNumber: string) {
  userSessions.delete(phoneNumber);
}

// Main message processor
export async function processWhatsAppMessage(message: ChatbotMessage): Promise<any> {
  const { companyId, from, messageText, buttonId } = message;

  const company = await Company.findById(companyId);
  if (!company) {
    console.error('❌ Company not found:', companyId);
    return;
  }

  const session = getSession(from, companyId);
  const userInput = (buttonId || messageText || '').trim().toLowerCase();

  console.log('🔄 Processing message:', { from, step: session.step, input: userInput });

  // Initial greeting
  if (session.step === 'start' && (userInput === 'hi' || userInput === 'hello' || userInput === 'start')) {
    await showLanguageSelection(session, message, company);
    return;
  }

  // Language selection
  if (session.step === 'language_selection') {
    if (userInput === 'english' || buttonId === 'lang_en') {
      session.language = 'en';
      await showMainMenu(session, message, company);
    } else if (userInput === 'hindi' || buttonId === 'lang_hi') {
      session.language = 'hi';
      await showMainMenu(session, message, company);
    } else if (userInput === 'marathi' || buttonId === 'lang_mr') {
      session.language = 'mr';
      await showMainMenu(session, message, company);
    }
    return;
  }

  // Main menu handling
  if (session.step === 'main_menu') {
    await handleMainMenuSelection(session, message, company, buttonId || userInput);
    return;
  }

  // OTP verification
  if (session.step === 'otp_verification') {
    const isValid = await verifyOTP(from, userInput);
    if (isValid) {
      await sendWhatsAppMessage(company, from, '✅ OTP verified successfully!');
      if (session.pendingAction === 'grievance') {
        await startGrievanceFlow(session, message, company);
      }
    } else {
      await sendWhatsAppMessage(company, from, '❌ Invalid OTP. Please try again:');
    }
    return;
  }

  // Grievance flow
  if (session.step.startsWith('grievance_')) {
    await continueGrievanceFlow(session, userInput, message, company);
    return;
  }
}

// Show language selection with module check
async function showLanguageSelection(session: UserSession, message: ChatbotMessage, company: any) {
  // Check if company has any enabled modules
  if (!company.enabledModules || company.enabledModules.length === 0) {
    await sendWhatsAppMessage(
      company,
      message.from,
      '❌ Sorry, this service is currently unavailable. Please contact your administrator.'
    );
    await clearSession(message.from);
    return;
  }

  await sendWhatsAppButtons(
    company,
    message.from,
    '🙏 Welcome to Zilla Parishad Service Portal!\n\nPlease select your preferred language:',
    [
      { id: 'lang_en', title: '🇬🇧 English' },
      { id: 'lang_hi', title: '🇮🇳 हिंदी' },
      { id: 'lang_mr', title: '🇮🇳 मराठी' }
    ]
  );
  session.step = 'language_selection';
  await updateSession(session);
}

// Show main menu - only enabled modules
async function showMainMenu(session: UserSession, message: ChatbotMessage, company: any) {
  const buttons = [];
  
  // Check enabled modules and add corresponding buttons
  if (company.enabledModules.includes('GRIEVANCE')) {
    buttons.push({ id: 'grievance', title: '📝 Raise Grievance' });
  }
  
  if (company.enabledModules.includes('APPOINTMENT')) {
    buttons.push({ id: 'appointment', title: '📅 Book Appointment' });
  }
  
  // Track status is always available if at least one module is enabled
  if (buttons.length > 0) {
    buttons.push({ id: 'track', title: '🔍 Track Status' });
  }

  if (buttons.length === 0) {
    await sendWhatsAppMessage(
      company,
      message.from,
      '❌ Sorry, no services are currently available.'
    );
    await clearSession(message.from);
    return;
  }

  await sendWhatsAppButtons(
    company,
    message.from,
    '📋 *Main Menu*\n\nPlease select an option:',
    buttons
  );

  session.step = 'main_menu';
  await updateSession(session);
}

// Handle main menu selection with module validation
async function handleMainMenuSelection(
  session: UserSession,
  message: ChatbotMessage,
  company: any,
  selection: string
) {
  switch (selection) {
    case 'grievance':
      // Check if grievance module is enabled
      if (!company.enabledModules.includes('GRIEVANCE')) {
        await sendWhatsAppMessage(
          company,
          message.from,
          '❌ Grievance service is not available. Please select another option.'
        );
        await showMainMenu(session, message, company);
        return;
      }
      
      // OTP verification
      if (!isPhoneVerified(message.from)) {
        await sendOTP(company, message.from, message.companyId);
        session.step = 'otp_verification';
        session.pendingAction = 'grievance';
        await updateSession(session);
      } else {
        await startGrievanceFlow(session, message, company);
      }
      break;

    case 'appointment':
      // Check if appointment module is enabled
      if (!company.enabledModules.includes('APPOINTMENT')) {
        await sendWhatsAppMessage(
          company,
          message.from,
          '❌ Appointment booking service is not available.'
        );
        await showMainMenu(session, message, company);
        return;
      }
      
      await sendWhatsAppMessage(
        company,
        message.from,
        '📅 Appointment booking coming soon!'
      );
      await showMainMenu(session, message, company);
      break;

    case 'track':
      await sendWhatsAppMessage(
        company,
        message.from,
        '🔍 Status tracking coming soon!'
      );
      await showMainMenu(session, message, company);
      break;

    default:
      await sendWhatsAppMessage(
        company,
        message.from,
        '❌ Invalid option. Please try again.'
      );
      await showMainMenu(session, message, company);
  }
}

// Start grievance flow
async function startGrievanceFlow(session: UserSession, message: ChatbotMessage, company: any) {
  await sendWhatsAppMessage(
    company,
    message.from,
    '📝 *Raise a Grievance*\n\nPlease enter your full name:'
  );
  session.step = 'grievance_name';
  session.data = {};
  await updateSession(session);
}

// Continue grievance flow
async function continueGrievanceFlow(
  session: UserSession,
  userInput: string,
  message: ChatbotMessage,
  company: any
) {
  switch (session.step) {
    case 'grievance_name':
      session.data.citizenName = userInput;
      
      // Get available categories based on company departments
      const categories = await getAvailableCategories(company._id);
      const categoryButtons = categories.slice(0, 3).map((cat, idx) => ({
        id: `cat_${cat}`,
        title: `${idx + 1}. ${cat.charAt(0).toUpperCase() + cat.slice(1)}`
      }));
      
      await sendWhatsAppButtons(
        company,
        message.from,
        '📂 *Select Complaint Category:*\n\nChoose from the options below:',
        categoryButtons
      );
      
      session.step = 'grievance_category';
      await updateSession(session);
      break;

    case 'grievance_category':
      let category = userInput.replace('cat_', '');
      if (!category) category = 'others';
      
      session.data.category = category;
      
      await sendWhatsAppMessage(
        company,
        message.from,
        '📝 Please describe your complaint in detail:'
      );
      session.step = 'grievance_description';
      await updateSession(session);
      break;

    case 'grievance_description':
      session.data.description = userInput;
      
      await sendWhatsAppMessage(
        company,
        message.from,
        '📍 Please share your location or type the address\n(or type "skip" to skip):'
      );
      session.step = 'grievance_location';
      await updateSession(session);
      break;

    case 'grievance_location':
      if (userInput !== 'skip') {
        session.data.address = userInput;
      }
      
      await sendWhatsAppMessage(
        company,
        message.from,
        '📷 Please upload a photo if available\n(or type "skip" to skip):'
      );
      session.step = 'grievance_photo';
      await updateSession(session);
      break;

    case 'grievance_photo':
      if (message.mediaUrl) {
        session.data.media = [{ url: message.mediaUrl, uploadedAt: new Date() }];
      }
      
      // Create grievance with proper department routing
      await createGrievanceWithDepartment(session, message, company);
      break;
  }
}

// Create grievance with automatic department routing
async function createGrievanceWithDepartment(
  session: UserSession,
  message: ChatbotMessage,
  company: any
) {
  try {
    // Find appropriate department based on category
    const departmentId = await findDepartmentByCategory(company._id, session.data.category);
    
    const grievanceData = {
      companyId: company._id,
      departmentId: departmentId || undefined,
      citizenName: session.data.citizenName,
      citizenPhone: message.from,
      citizenWhatsApp: message.from,
      description: session.data.description,
      category: session.data.category,
      address: session.data.address,
      media: session.data.media || [],
      status: GrievanceStatus.PENDING,
      priority: 'MEDIUM',
      source: 'WHATSAPP'
    };

    const grievance = await Grievance.create(grievanceData);
    
    console.log('✅ Grievance created:', {
      id: grievance.grievanceId,
      department: departmentId,
      category: session.data.category
    });

    await sendWhatsAppMessage(
      company,
      message.from,
      `✅ *Grievance Registered Successfully!*\n\n` +
      `📋 Grievance ID: *${grievance.grievanceId}*\n` +
      `📂 Category: ${session.data.category}\n` +
      `🏢 Department: ${departmentId ? 'Assigned' : 'Pending'}\n\n` +
      `You will receive updates on your complaint status.`
    );

    // Reset session
    await clearSession(message.from);
    
    // Optionally show main menu again
    setTimeout(async () => {
      const newSession = getSession(message.from, company._id.toString());
      await showMainMenu(newSession, message, company);
    }, 2000);

  } catch (error: any) {
    console.error('❌ Error creating grievance:', error);
    await sendWhatsAppMessage(
      company,
      message.from,
      '❌ Failed to register grievance. Please try again later.'
    );
    await clearSession(message.from);
  }
}

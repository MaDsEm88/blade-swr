import { Resend } from "resend";

const RESEND_API_KEY = process.env["BLADE_RESEND_API_KEY"];

if (!RESEND_API_KEY) {
  console.warn("BLADE_RESEND_API_KEY is not configured. Email functionality will not work.");
}

export const resend = new Resend(RESEND_API_KEY);

// Helper function to check if Resend is properly configured
export const isResendConfigured = (): boolean => {
  return !!RESEND_API_KEY;
};

// Helper function to validate email configuration
export const validateEmailConfig = (): { isValid: boolean; error?: string } => {
  if (!RESEND_API_KEY) {
    return {
      isValid: false,
      error: "Resend API key is not configured"
    };
  }

  if (!RESEND_API_KEY.startsWith('re_')) {
    return {
      isValid: false,
      error: "Invalid Resend API key format"
    };
  }

  return { isValid: true };
};
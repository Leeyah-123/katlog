import { ValidationResult } from '@/types';
import { PublicKey } from '@solana/web3.js';

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }
  if (!passwordRegex.test(password)) {
    return {
      valid: false,
      error:
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
    };
  }

  return { valid: true };
};

export const validateAddress = (address: string): ValidationResult => {
  if (!address) {
    return { valid: false, error: 'Address is required' };
  }
  // Validate solana address
  try {
    const pubkey = new PublicKey(address);
    if (PublicKey.isOnCurve(pubkey.toBuffer())) {
      return { valid: true };
    } else
      return { valid: false, error: 'Please enter a valid Solana address' };
  } catch {
    return { valid: false, error: 'Please enter a valid Solana address' };
  }
};

export const validateLabel = (label: string): ValidationResult => {
  if (!label) {
    return { valid: false, error: 'Label is required' };
  }
  if (label.length < 2) {
    return { valid: false, error: 'Label must be at least 2 characters' };
  }
  if (label.length > 30) {
    return { valid: false, error: 'Label must not exceed 30 characters' };
  }

  return { valid: true };
};

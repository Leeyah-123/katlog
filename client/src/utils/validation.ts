export const validateAddress = (
  address: string
): { valid: boolean; error?: string } => {
  if (!address) {
    return { valid: false, error: 'Address is required' };
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return { valid: false, error: 'Invalid Ethereum address format' };
  }

  return { valid: true };
};

export const validateLabel = (
  label: string
): { valid: boolean; error?: string } => {
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

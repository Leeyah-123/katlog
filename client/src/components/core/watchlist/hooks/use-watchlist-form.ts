'use client';

import { validateAddress, validateLabel } from '@/utils/validation';
import { FormEvent, useState } from 'react';

interface UseWatchlistFormProps {
  onSubmit: (
    address: string,
    label: string,
    emailNotifications: boolean
  ) => Promise<boolean>;
  initialAddress?: string;
  initialLabel?: string;
  initialNotifications?: boolean;
}

export const useWatchlistForm = ({
  onSubmit,
  initialAddress = '',
  initialLabel = '',
  initialNotifications = false,
}: UseWatchlistFormProps) => {
  const [address, setAddress] = useState(initialAddress);
  const [label, setLabel] = useState(initialLabel);
  const [emailNotifications, setEmailNotifications] =
    useState(initialNotifications);
  const [addressError, setAddressError] = useState('');
  const [labelError, setLabelError] = useState('');

  const resetForm = () => {
    setAddress('');
    setLabel('');
    setEmailNotifications(false);
    setAddressError('');
    setLabelError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const addressValidation = validateAddress(address);
    const labelValidation = validateLabel(label);

    if (!addressValidation.valid) {
      setAddressError(addressValidation.error!);
      return false;
    }
    if (!labelValidation.valid) {
      setLabelError(labelValidation.error!);
      return false;
    }

    setAddressError('');
    setLabelError('');

    const success = await onSubmit(address, label, emailNotifications);
    if (success) {
      resetForm();
      return true;
    }
    return false;
  };

  return {
    address,
    setAddress,
    label,
    setLabel,
    emailNotifications,
    setEmailNotifications,
    addressError,
    labelError,
    handleSubmit,
    resetForm,
  };
};

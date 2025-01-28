'use client';

import { validateAddress, validateLabel } from '@/utils/validation';
import { Notify } from 'notiflix';
import { FormEvent, useState } from 'react';

interface UseWatchlistFormProps {
  onSubmit: (
    address: string,
    label: string,
    emailNotifications: boolean,
    watchedNetworks: string[]
  ) => Promise<{ success: boolean; error?: string }>;
  initialAddress?: string;
  initialLabel?: string;
  initialNotifications?: boolean;
  initialWatchedNetworks?: string[];
}

export const useWatchlistForm = ({
  onSubmit,
  initialAddress = '',
  initialLabel = '',
  initialNotifications = false,
  initialWatchedNetworks = [],
}: UseWatchlistFormProps) => {
  const [address, setAddress] = useState(initialAddress);
  const [label, setLabel] = useState(initialLabel);
  const [emailNotifications, setEmailNotifications] =
    useState(initialNotifications);
  const [addressError, setAddressError] = useState('');
  const [labelError, setLabelError] = useState('');
  const [watchedNetworks, setWatchedNetworks] = useState(
    initialWatchedNetworks
  );

  const resetForm = () => {
    setAddress('');
    setLabel('');
    setAddressError('');
    setLabelError('');
    setWatchedNetworks([]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const addressValidation = validateAddress(address);
    const labelValidation = validateLabel(label);

    if (!addressValidation.valid) {
      setAddressError(addressValidation.error!);
      Notify.failure(addressValidation.error!);
      return false;
    }
    if (!labelValidation.valid) {
      setLabelError(labelValidation.error!);
      Notify.failure(labelValidation.error!);
      return false;
    }

    setAddressError('');
    setLabelError('');

    const result = await onSubmit(
      address,
      label,
      emailNotifications,
      watchedNetworks || []
    );
    if (result.success) {
      resetForm();
      Notify.success('Address added to watchlist');
      return true;
    } else {
      Notify.failure(result.error || 'An unexpected error occurred');
      return false;
    }
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
    watchedNetworks,
    setWatchedNetworks,
  };
};

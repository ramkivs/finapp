import React from 'react';
import { useCanonicalLedger } from '../store/useCanonicalLedger';

interface Props {
  value: number;
  sensitive?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export const CurrencyValue: React.FC<Props> = ({
  value,
  sensitive = true,
  prefix = '₹',
  suffix = '',
  className = '',
  decimals = 0
}) => {
  const privacyMasked = useCanonicalLedger(state => state.privacyMasked);

  if (sensitive && privacyMasked) {
    return <span className={className}>{prefix} ••••••{suffix}</span>;
  }

  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return <span className={className}>{prefix}{formatted}{suffix}</span>;
};

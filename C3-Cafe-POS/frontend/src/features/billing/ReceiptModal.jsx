import React from 'react';
import ReceiptPreviewModal from '../receipt/ReceiptPreviewModal';

export default function ReceiptModal({ invoice, onClose }) {
  if (!invoice) return null;

  return (
    <ReceiptPreviewModal
      invoice={invoice}
      isOpen={!!invoice}
      onClose={onClose}
    />
  );
}

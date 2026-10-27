import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrProps {
  value: string;
  size?: number;
  className?: string;
}

export const QrCodeRenderer: React.FC<QrProps> = ({ value, size = 64, className = '' }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        setDataUrl(url);
      })
      .catch((err) => {
        console.warn('QR Code generate error:', err);
      });
  }, [value, size]);

  if (!dataUrl) {
    return <div style={{ width: size, height: size }} className="bg-slate-100" />;
  }

  return (
    <img
      src={dataUrl}
      alt={value}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      referrerPolicy="no-referrer"
    />
  );
};

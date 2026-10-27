import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  className?: string;
  format?: string;
}

export const BarcodeRenderer: React.FC<BarcodeProps> = ({
  value,
  width = 1.6,
  height = 40,
  displayValue = true,
  fontSize = 12,
  className = '',
  format = 'CODE128',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: format || 'CODE128',
          width,
          height,
          displayValue,
          fontSize,
          margin: 0,
          font: 'monospace',
          textMargin: 2,
        });
      } catch (err) {
        console.warn('Barcode render error:', err);
      }
    }
  }, [value, width, height, displayValue, fontSize, format]);

  return <svg ref={svgRef} className={`barcode-svg ${className}`} />;
};

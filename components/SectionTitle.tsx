import React from 'react';

/** Two-tone heading used across the site: thin grey lead words + bold orange words. */
export default function SectionTitle({
  light,
  bold,
  subtitle,
  className = '',
}: {
  light: string;
  bold: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`text-center mb-8 md:mb-10 ${className}`}>
      <h2 className="text-[26px] md:text-[36px] leading-tight">
        <span className="font-light text-brand-gray">{light}</span> <span className="font-bold text-brand-orange">{bold}</span>
      </h2>
      {subtitle && <p className="text-sm text-brand-gray mt-2 max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
}

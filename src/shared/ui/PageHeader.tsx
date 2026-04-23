import type { ReactNode } from 'react';

import { Button } from './Button';

interface PageHeaderProps {
  title: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  subtitle?: string;
}

export function PageHeader({ title, leading, trailing, subtitle }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-3xl items-center gap-3 px-4 py-3">
        {leading ?? <div className="h-11 w-11" aria-hidden="true" />}
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          {subtitle ? <p className="text-sm text-gray-500">{subtitle}</p> : null}
        </div>
        {trailing ?? <div className="h-11 w-11" aria-hidden="true" />}
      </div>
    </header>
  );
}

export function BackButton({ onClick, label = 'Volver' }: { onClick: () => void; label?: string }) {
  return (
    <Button
      aria-label={label}
      className="h-11 w-11 rounded-full px-0 text-lg"
      onClick={onClick}
      variant="ghost"
    >
      <span aria-hidden="true">←</span>
    </Button>
  );
}

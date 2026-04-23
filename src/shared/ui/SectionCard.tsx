import type { PropsWithChildren, ReactNode } from 'react';

interface SectionCardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionCard({
  action,
  children,
  className = '',
  description,
  title,
}: PropsWithChildren<SectionCardProps>) {
  return (
    <section
      className={`rounded-3xl border border-gray-100 bg-white p-4 shadow-sm ${className}`.trim()}
    >
      {title ? (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
            {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

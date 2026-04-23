import type { ReactNode } from 'react';

import { Button } from './Button';

interface LoadingStateProps {
  label?: string;
  fullScreen?: boolean;
}

export function LoadingState({ label = 'Cargando...', fullScreen = false }: LoadingStateProps) {
  return (
    <div
      className={
        fullScreen
          ? 'flex min-h-screen items-center justify-center px-4'
          : 'flex justify-center py-12'
      }
    >
      <div className="flex flex-col items-center gap-3 text-sm text-gray-500">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-brand" />
        <span>{label}</span>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function EmptyState({
  actionLabel,
  description,
  icon = '•',
  onAction,
  title,
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-500">
        {icon}
      </div>
      <h2 className="mt-4 text-lg font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
      {actionLabel && onAction ? (
        <div className="mt-5">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      ) : null}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorState({
  actionLabel = 'Reintentar',
  description,
  onAction,
  title = 'Algo salio mal',
}: ErrorStateProps) {
  return (
    <div className="rounded-3xl border border-red-100 bg-red-50 px-6 py-6 text-center">
      <h2 className="text-lg font-bold text-red-700">{title}</h2>
      <p className="mt-2 text-sm text-red-600">{description}</p>
      {onAction ? (
        <div className="mt-4">
          <Button onClick={onAction} variant="secondary">
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

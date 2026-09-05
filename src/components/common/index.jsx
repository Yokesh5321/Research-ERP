// Common UI components

import { Loader2, Search, Inbox, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// LoadingState
export const LoadingState = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
    <Loader2 className="w-8 h-8 animate-spin mb-3" />
    <p className="text-sm">{message}</p>
  </div>
);

// EmptyState
export const EmptyState = ({ title = 'No data', message = 'Nothing to show here.', icon: Icon = Inbox, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <Icon className="w-12 h-12 mb-4 text-gray-300" />
    <h3 className="text-sm font-semibold text-gray-500 mb-1">{title}</h3>
    <p className="text-sm text-gray-400 mb-4">{message}</p>
    {action && action}
  </div>
);

// ErrorState
export const ErrorState = ({ message = 'Something went wrong.', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <AlertCircle className="w-12 h-12 mb-4 text-red-400" />
    <h3 className="text-sm font-semibold text-gray-600 mb-1">Error</h3>
    <p className="text-sm text-gray-400 mb-4">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn btn-secondary btn-sm">
        Try Again
      </button>
    )}
  </div>
);

// SearchBar
export const SearchBar = ({ value, onChange, placeholder = 'Search...', className = '' }) => (
  <div className={`relative ${className}`}>
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input pl-9"
    />
  </div>
);

// Pagination
export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <p className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn btn-ghost btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = i + 1;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn btn-ghost btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ProgressBar
export const ProgressBar = ({ value = 0, className = '' }) => (
  <div className={`progress-bar ${className}`}>
    <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
  </div>
);

// Avatar
export const Avatar = ({ name, size = 'md' }) => {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg' };
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
    : '?';
  return (
    <div className={`${sizes[size]} rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  );
};

// PageHeader
export const PageHeader = ({ title, subtitle, actions, breadcrumbs }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      {breadcrumbs && (
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span>/</span>}
              <span className={i === breadcrumbs.length - 1 ? 'text-gray-600' : ''}>{b}</span>
            </span>
          ))}
        </nav>
      )}
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

// StatCard
export const StatCard = ({ label, value, icon: Icon, trend, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-100 text-gray-500',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          {trend && <p className="text-xs text-gray-400 mt-1">{trend}</p>}
        </div>
        {Icon && (
          <div className={`p-2 rounded-md ${colors[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

// ConfirmModal
export const ConfirmModal = ({ open, title, message, onConfirm, onCancel, danger = false }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn btn-secondary">Cancel</button>
          <button onClick={onConfirm} className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

// Modal wrapper
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className={`relative bg-white rounded-lg shadow-xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
};

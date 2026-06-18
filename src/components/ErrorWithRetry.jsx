function ErrorWithRetry({ message, onRetry }) {
  return (
    <div className="error-container">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--danger)' }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <div className="error-message">{message || 'Failed to load data'}</div>
      {onRetry && (
        <button className="btn-retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorWithRetry;

function LoadingSkeleton({ type = 'card' }) {
  if (type === 'match') {
    return (
      <div className="match-card" style={{ border: '2px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div className="skeleton skeleton-avatar" />
            <div className="skeleton skeleton-text" style={{ width: '80px' }} />
          </div>
          <div className="skeleton skeleton-text" style={{ width: '60px', height: '2rem' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div className="skeleton skeleton-avatar" />
            <div className="skeleton skeleton-text" style={{ width: '80px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'user-card') {
    return (
      <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="skeleton skeleton-avatar" />
            <div className="skeleton skeleton-text" style={{ width: '100px' }} />
          </div>
          <div className="skeleton skeleton-text" style={{ width: '60px' }} />
        </div>
        <div style={{ display: 'flex', height: '180px' }}>
          <div className="skeleton" style={{ flex: 1 }} />
          <div className="skeleton" style={{ flex: 1 }} />
        </div>
      </div>
    );
  }

  if (type === 'leaderboard') {
    return (
      <div className="leaderboard-item">
        <div className="skeleton" style={{ width: '40px', height: '1.5rem' }} />
        <div style={{ flex: 1, padding: '0 1rem' }}>
          <div className="skeleton skeleton-text" style={{ width: '120px', marginBottom: '0.5rem' }} />
          <div className="skeleton skeleton-text" style={{ width: '180px' }} />
        </div>
        <div className="skeleton" style={{ width: '60px', height: '2rem' }} />
      </div>
    );
  }

  return <div className="skeleton skeleton-card" />;
}

export default LoadingSkeleton;

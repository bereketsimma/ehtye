export default function Payments() {
  return (
    <div>
      <div className="page-header">
        <h1>Payments</h1>
        <p>Manage payments and transactions</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeftColor: '#2e7d32' }}>
          <div className="stat-icon">💰</div>
          <div className="stat-value">$0</div>
          <div className="stat-label">Total Earned</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#e65100' }}>
          <div className="stat-icon">📤</div>
          <div className="stat-value">$0</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#1565c0' }}>
          <div className="stat-icon">📊</div>
          <div className="stat-value">0</div>
          <div className="stat-label">Transactions</div>
        </div>
      </div>

      <div className="card">
        <h3>Transaction History</h3>
        <p style={{ color: '#78909c', textAlign: 'center', padding: '40px 0' }}>
          Payment integration coming soon.
        </p>
      </div>
    </div>
  )
}

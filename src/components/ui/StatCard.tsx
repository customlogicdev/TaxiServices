export function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="stat-card">
      <div className="stat-card-inner">
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value}</div>
        </div>
        <div className={`stat-icon ${color}`}>{icon}</div>
      </div>
    </div>
  );
}
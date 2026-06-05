interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ children, variant = 'info' }: BadgeProps) {
  const colors = {
    success: { bg: '#D1FAE5', color: '#059669' },
    warning: { bg: '#FEF3C7', color: '#D97706' },
    danger: { bg: '#FEE2E2', color: '#DC2626' },
    info: { bg: '#DBEAFE', color: '#2563EB' }
  };

  const style = colors[variant];

  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 500,
      background: style.bg,
      color: style.color
    }}>
      {children}
    </span>
  );
}
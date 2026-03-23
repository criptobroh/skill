'use client';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export function Card({ title, children, className = '', interactive = false }: CardProps) {
  return (
    <div className={`card ${interactive ? 'card-interactive' : ''} ${className}`}>
      {title && (
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

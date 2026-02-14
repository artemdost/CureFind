import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  highlighted?: boolean;
}

export default function Card({ children, className = '', highlighted = false }: CardProps) {
  return (
    <div
      className={`rounded-xl p-6 transition-shadow hover:shadow-lg ${
        highlighted
          ? 'bg-primary text-white shadow-lg ring-2 ring-primary'
          : 'bg-white shadow-md'
      } ${className}`}
    >
      {children}
    </div>
  );
}

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
}

function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn('container mx-auto px-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Container };
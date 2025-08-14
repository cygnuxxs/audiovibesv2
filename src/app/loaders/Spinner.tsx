import React from 'react';
import { cn } from '@/lib/utils';
import './spinner.css'

interface MusicSpectrumLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'muted' | 'destructive';
}

const MusicSpectrumLoader: React.FC<MusicSpectrumLoaderProps> = ({
  className,
  size = 'md',
  variant = 'default'
}) => {
  const sizeConfig = {
    sm: {
      container: 'h-4 w-6 gap-0.5',
      bar: 'w-0.5 rounded-sm'
    },
    md: {
      container: 'h-8 w-12 gap-1',
      bar: 'w-1 rounded'
    },
    lg: {
      container: 'h-20 w-24 gap-1',
      bar: 'w-1.5 rounded-md'
    }
  };

  const variantClasses = {
    default: 'bg-primary',
    muted: 'bg-muted-foreground',
    destructive: 'bg-destructive'
  };

  return (
    <div className='w-full h-full flex items-center justify-center'>
    <div
      className={cn(
        'flex items-center justify-center',
        sizeConfig[size].container,
        className
      )}
      role="status"
      aria-label="Loading music spectrum"
    >
      {/* Bar 1 */}
      <div
        className={cn(
          'animate-pulse',
          sizeConfig[size].bar,
          variantClasses[variant]
        )}
        style={{
          height: '20%',
          animation: 'spectrum-wave 1.5s ease-in-out infinite',
          animationDelay: '0s'
        }}
      />
      
      {/* Bar 2 */}
      <div
        className={cn(
          'animate-pulse',
          sizeConfig[size].bar,
          variantClasses[variant]
        )}
        style={{
          height: '40%',
          animation: 'spectrum-wave 1.5s ease-in-out infinite',
          animationDelay: '0.1s'
        }}
      />
      
      {/* Bar 3 */}
      <div
        className={cn(
          'animate-pulse',
          sizeConfig[size].bar,
          variantClasses[variant]
        )}
        style={{
          height: '80%',
          animation: 'spectrum-wave 1.5s ease-in-out infinite',
          animationDelay: '0.2s'
        }}
      />
      
      {/* Bar 4 */}
      <div
        className={cn(
          'animate-pulse',
          sizeConfig[size].bar,
          variantClasses[variant]
        )}
        style={{
          height: '60%',
          animation: 'spectrum-wave 1.5s ease-in-out infinite',
          animationDelay: '0.3s'
        }}
      />
      
      {/* Bar 5 */}
      <div
        className={cn(
          'animate-pulse',
          sizeConfig[size].bar,
          variantClasses[variant]
        )}
        style={{
          height: '30%',
          animation: 'spectrum-wave 1.5s ease-in-out infinite',
          animationDelay: '0.4s'
        }}
      />
    </div>
    </div>
  );
};

export default MusicSpectrumLoader;

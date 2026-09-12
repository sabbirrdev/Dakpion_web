import clsx from 'clsx';
import { Link, type LinkProps } from 'react-router-dom';
import { sizeClasses, variantClasses, type Size, type Variant } from './buttonStyles';

interface LinkButtonProps extends LinkProps {
  variant?: Variant;
  size?: Size;
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <Link
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}

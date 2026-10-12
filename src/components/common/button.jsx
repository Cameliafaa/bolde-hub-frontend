import React from "react";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = "",
  ...props
}) => {
  const baseClass = `
    inline-flex
    items-center
    justify-center
    font-medium
    transition-all
    duration-200
    outline-none
    focus:ring-4
    disabled:opacity-50
    disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
    bg-gradient-to-r
    from-brand-gradientFrom
    via-brand-gradientVia
    to-brand-gradientTo
    text-white
    hover:brightness-95
    focus:ring-brand-primary/20
    shadow-sm
  `,

    secondary: `
    bg-brand-secondary
    text-white
    hover:bg-brand-secondaryHover
    focus:ring-brand-secondary/20
  `,

    outline: `
    bg-white
    text-text-primary
    border
    border-surface-border
    hover:border-brand-primary
    hover:text-brand-primary
    hover:bg-brand-soft
    focus:ring-brand-primary/10
  `,

    ghost: `
    bg-transparent
    text-text-secondary
    hover:bg-brand-soft
    hover:text-brand-primary
    focus:ring-brand-primary/10
  `,

    danger: `
    bg-status-danger
    text-white
    hover:opacity-90
    focus:ring-status-danger/20
  `,

    success: `
    bg-status-success
    text-white
    hover:opacity-90
    focus:ring-status-success/20
  `,
  };

  const sizes = {
    sm: "h-9 px-4 text-xs rounded-lg",
    md: "h-11 px-5 text-sm rounded-xl",
    lg: "h-13 px-6 py-3.5 text-sm rounded-xl",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        ${baseClass}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="
              w-4
              h-4
              mr-2
              border-2
              border-current
              border-t-transparent
              rounded-full
              animate-spin
            "
          />
          Memproses...
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}

          {children}

          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;

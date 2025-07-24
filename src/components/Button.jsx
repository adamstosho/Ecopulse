import React from "react";

import PropTypes from "prop-types"

const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-105"

  const variants = {
    primary: "bg-earth-green-500 text-white hover:bg-earth-green-600 focus:ring-earth-green-500 shadow-md",
    secondary: "bg-forest-dark-500 text-white hover:bg-forest-dark-600 focus:ring-forest-dark-500 shadow-md",
    outline:
      "border-2 border-earth-green-500 text-earth-green-500 hover:bg-earth-green-500 hover:text-white focus:ring-earth-green-500",
    ghost: "text-charcoal-600 hover:bg-sand-light-200 focus:ring-charcoal-500",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  }

  const disabledClasses = "opacity-50 cursor-not-allowed hover:scale-100"

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? disabledClasses : ""} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "outline", "ghost"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
}

export default Button

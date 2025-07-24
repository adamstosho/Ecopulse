import React from "react";
import PropTypes from "prop-types"

const Badge = ({ children, variant = "default", size = "md", icon, className = "", ...props }) => {
  const baseClasses = "inline-flex items-center font-medium rounded-2xl animate-fade-in"

  const variants = {
    default: "bg-earth-green-100 text-earth-green-800",
    success: "bg-earth-green-500 text-white",
    warning: "bg-sand-light-400 text-sand-light-900",
    info: "bg-sky-blue-100 text-sky-blue-800",
    achievement: "bg-gradient-to-r from-earth-green-400 to-sky-blue-400 text-white shadow-md",
  }

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  }

  return (
    <span className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  )
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["default", "success", "warning", "info", "achievement"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  icon: PropTypes.node,
  className: PropTypes.string,
}

export default Badge

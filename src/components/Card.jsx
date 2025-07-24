import React from "react";
import PropTypes from "prop-types"

const Card = ({ children, title, subtitle, className = "", hover = false, ...props }) => {
  const baseClasses = "bg-white rounded-2xl shadow-md border border-sand-light-200 p-6"
  const hoverClasses = hover ? "transition-all duration-200 hover:scale-105 cursor-pointer" : ""

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className} animate-slide-up`} {...props}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-xl font-semibold text-charcoal-800 mb-1">{title}</h3>}
          {subtitle && <p className="text-sm text-charcoal-600">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  className: PropTypes.string,
  hover: PropTypes.bool,
}

export default Card

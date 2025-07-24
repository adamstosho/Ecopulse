import React from "react";

import PropTypes from "prop-types"

const FormInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className = "",
  ...props
}) => {
  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-charcoal-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-2 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-earth-green-500 focus:border-transparent transition-colors ${
          error ? "border-red-500 bg-red-50" : "border-sand-light-300 bg-white hover:border-earth-green-300"
        }`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />

      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

FormInput.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
}

export default FormInput

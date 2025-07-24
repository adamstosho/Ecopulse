import React from "react"
import PropTypes from "prop-types"
import { X } from "lucide-react"
import Button from "./Button"

const Modal = ({ isOpen, onClose, title, children, className = "" }) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-charcoal-900 bg-opacity-50 animate-fade-in" onClick={onClose} />

      {/* Modal Content */}
      <div className={`relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 animate-slide-up ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sand-light-200">
          <h2 className="text-xl font-semibold text-charcoal-800">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

export default Modal

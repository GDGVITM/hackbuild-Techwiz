"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils/utils"

interface NotificationProps {
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  onClose?: () => void
  className?: string
}

export function Notification({ 
  title, 
  message, 
  type = 'info', 
  onClose, 
  className 
}: NotificationProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  return (
    <div className={cn(
      "relative w-full rounded-lg border p-4",
      getTypeStyles(),
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm mt-1">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 flex-shrink-0 text-current hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

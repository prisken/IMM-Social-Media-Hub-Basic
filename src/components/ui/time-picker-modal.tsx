import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, X, Check, Calendar, Zap } from 'lucide-react'

interface TimePickerModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (dateTime: Date) => void
  selectedDate: Date
  postTitle: string
}

export function TimePickerModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedDate, 
  postTitle 
}: TimePickerModalProps) {
  const [selectedTime, setSelectedTime] = useState({
    hours: new Date().getHours(),
    minutes: Math.ceil(new Date().getMinutes() / 15) * 15 // Round to nearest 15 minutes
  })

  // Reset time when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date()
      setSelectedTime({
        hours: now.getHours(),
        minutes: Math.ceil(now.getMinutes() / 15) * 15
      })
    }
  }, [isOpen])

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleConfirm = () => {
    const newDate = new Date(selectedDate)
    newDate.setHours(selectedTime.hours, selectedTime.minutes, 0, 0)
    onConfirm(newDate)
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  const timeOptions = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const value = hour * 60 + minute
      timeOptions.push({ label: timeString, value })
    }
  }

  const currentTimeValue = selectedTime.hours * 60 + selectedTime.minutes

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[9998]"
            onClick={handleCancel}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-background border border-border rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Schedule Post</h3>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Post Title */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Post:</p>
                  <p className="font-medium text-foreground truncate">{postTitle}</p>
                </div>

                {/* Date */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date:</p>
                  <p className="font-medium text-foreground">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Time Selection */}
                <div>
                  <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Select Time:
                  </p>
                  
                  {/* Quick Time Buttons - Morning */}
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Morning</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: '8 AM', hours: 8, minutes: 0 },
                        { label: '9 AM', hours: 9, minutes: 0 },
                        { label: '10 AM', hours: 10, minutes: 0 },
                        { label: '11 AM', hours: 11, minutes: 0 },
                      ].map((time) => (
                        <button
                          key={time.label}
                          onClick={() => setSelectedTime({ hours: time.hours, minutes: time.minutes })}
                          className={`p-2 text-xs rounded-lg border transition-all ${
                            selectedTime.hours === time.hours && selectedTime.minutes === time.minutes
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-background text-foreground border-border hover:bg-muted hover:border-primary/50'
                          }`}
                        >
                          {time.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Time Buttons - Afternoon */}
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Afternoon</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: '12 PM', hours: 12, minutes: 0 },
                        { label: '1 PM', hours: 13, minutes: 0 },
                        { label: '2 PM', hours: 14, minutes: 0 },
                        { label: '3 PM', hours: 15, minutes: 0 },
                      ].map((time) => (
                        <button
                          key={time.label}
                          onClick={() => setSelectedTime({ hours: time.hours, minutes: time.minutes })}
                          className={`p-2 text-xs rounded-lg border transition-all ${
                            selectedTime.hours === time.hours && selectedTime.minutes === time.minutes
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-background text-foreground border-border hover:bg-muted hover:border-primary/50'
                          }`}
                        >
                          {time.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Time Buttons - Evening */}
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Evening</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: '4 PM', hours: 16, minutes: 0 },
                        { label: '5 PM', hours: 17, minutes: 0 },
                        { label: '6 PM', hours: 18, minutes: 0 },
                        { label: '7 PM', hours: 19, minutes: 0 },
                      ].map((time) => (
                        <button
                          key={time.label}
                          onClick={() => setSelectedTime({ hours: time.hours, minutes: time.minutes })}
                          className={`p-2 text-xs rounded-lg border transition-all ${
                            selectedTime.hours === time.hours && selectedTime.minutes === time.minutes
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-background text-foreground border-border hover:bg-muted hover:border-primary/50'
                          }`}
                        >
                          {time.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Time Input */}
                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground mb-3 font-medium">Custom Time</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Hours</label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={selectedTime.hours}
                          onChange={(e) => setSelectedTime(prev => ({ 
                            ...prev, 
                            hours: Math.max(0, Math.min(23, parseInt(e.target.value) || 0))
                          }))}
                          className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Minutes</label>
                        <select
                          value={selectedTime.minutes}
                          onChange={(e) => setSelectedTime(prev => ({ 
                            ...prev, 
                            minutes: parseInt(e.target.value)
                          }))}
                          className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value={0}>00</option>
                          <option value={15}>15</option>
                          <option value={30}>30</option>
                          <option value={45}>45</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        const now = new Date()
                        setSelectedTime({
                          hours: now.getHours(),
                          minutes: Math.ceil(now.getMinutes() / 15) * 15
                        })
                      }}
                      className="flex-1 px-3 py-2 text-xs bg-muted hover:bg-muted/80 text-foreground rounded-lg border border-border transition-colors flex items-center justify-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      Now
                    </button>
                  </div>

                  {/* Preview */}
                  <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium text-primary">Scheduled for:</p>
                    </div>
                    <p className="font-semibold text-foreground text-lg">
                      {selectedDate.toLocaleDateString('en-US', { 
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-primary font-medium">
                      {selectedTime.hours.toString().padStart(2, '0')}:{selectedTime.minutes.toString().padStart(2, '0')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
                <div className="text-xs text-muted-foreground">
                  Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> to cancel
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-6 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    Schedule Post
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface TimePickerModalData {
  isOpen: boolean
  postId: string | null
  postTitle: string | null
  selectedDate: Date | null
  onConfirm: ((dateTime: Date) => void) | null
  onCancel: (() => void) | null
}

interface ModalContextType {
  timePickerModal: TimePickerModalData
  openTimePicker: (data: Omit<TimePickerModalData, 'isOpen'>) => void
  closeTimePicker: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [timePickerModal, setTimePickerModal] = useState<TimePickerModalData>({
    isOpen: false,
    postId: null,
    postTitle: null,
    selectedDate: null,
    onConfirm: null,
    onCancel: null
  })

  const openTimePicker = (data: Omit<TimePickerModalData, 'isOpen'>) => {
    setTimePickerModal({
      ...data,
      isOpen: true
    })
  }

  const closeTimePicker = () => {
    setTimePickerModal({
      isOpen: false,
      postId: null,
      postTitle: null,
      selectedDate: null,
      onConfirm: null,
      onCancel: null
    })
  }

  return (
    <ModalContext.Provider value={{ timePickerModal, openTimePicker, closeTimePicker }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

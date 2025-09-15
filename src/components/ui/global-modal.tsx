import React from 'react'
import { useModal } from './modal-provider'
import { TimePickerModal } from './time-picker-modal'

export function GlobalModal() {
  const { timePickerModal, closeTimePicker } = useModal()

  const handleConfirm = (dateTime: Date) => {
    if (timePickerModal.onConfirm) {
      timePickerModal.onConfirm(dateTime)
    }
    closeTimePicker()
  }

  const handleCancel = () => {
    if (timePickerModal.onCancel) {
      timePickerModal.onCancel()
    }
    closeTimePicker()
  }

  return (
    <>
      {timePickerModal.isOpen && timePickerModal.selectedDate && timePickerModal.postTitle && (
        <TimePickerModal
          isOpen={timePickerModal.isOpen}
          onClose={handleCancel}
          onConfirm={handleConfirm}
          selectedDate={timePickerModal.selectedDate}
          postTitle={timePickerModal.postTitle}
        />
      )}
    </>
  )
}

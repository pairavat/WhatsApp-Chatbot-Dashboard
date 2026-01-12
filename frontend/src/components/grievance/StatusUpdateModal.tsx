'use client';

import { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import toast from 'react-hot-toast';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemType: 'grievance' | 'appointment';
  currentStatus: string;
  onSuccess: () => void;
}

const grievanceStatuses = [
  { value: 'PENDING', label: 'Pending', color: 'yellow' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'blue' },
  { value: 'RESOLVED', label: 'Resolved', color: 'green' },
  { value: 'CLOSED', label: 'Closed', color: 'gray' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'red' }
];

const appointmentStatuses = [
  { value: 'PENDING', label: 'Pending', color: 'yellow' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'blue' },
  { value: 'COMPLETED', label: 'Completed', color: 'green' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'red' },
  { value: 'NO_SHOW', label: 'No Show', color: 'gray' }
];

export default function StatusUpdateModal({
  isOpen,
  onClose,
  itemId,
  itemType,
  currentStatus,
  onSuccess
}: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const statuses = itemType === 'grievance' ? grievanceStatuses : appointmentStatuses;

  const getStatusColor = (color: string) => {
    const colors = {
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200',
      green: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200',
      red: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const handleUpdate = async () => {
    if (selectedStatus === currentStatus) {
      toast.error('Please select a different status');
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiClient.put(
        `/status/${itemType}/${itemId}`,
        { status: selectedStatus, remarks }
      );

      if (response.success) {
        toast.success(
          `${itemType === 'grievance' ? 'Grievance' : 'Appointment'} status updated! Citizen notified via WhatsApp.`,
          { duration: 5000 }
        );
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 mr-3" />
            <div>
              <h2 className="text-2xl font-bold">Update Status</h2>
              <p className="text-green-100 text-sm mt-1">
                Change status and notify citizen via WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium mb-1">Current Status</p>
            <p className="text-lg font-bold text-blue-900">{currentStatus.replace('_', ' ')}</p>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select New Status <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setSelectedStatus(status.value)}
                  className={`
                    px-4 py-3 rounded-lg border-2 font-semibold transition-all
                    ${selectedStatus === status.value
                      ? `${getStatusColor(status.color)} border-opacity-100 ring-2 ring-offset-2`
                      : `${getStatusColor(status.color)} border-opacity-50`
                    }
                    ${status.value === currentStatus ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  disabled={status.value === currentStatus}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks / Notes
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Add any notes or comments about this status change..."
            />
          </div>

          {/* Info Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                Citizen Will Be Notified
              </p>
              <p className="text-sm text-amber-700 mt-1">
                The citizen will receive a WhatsApp message about this status update automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t rounded-b-lg">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={selectedStatus === currentStatus || submitting}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Update Status & Notify
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

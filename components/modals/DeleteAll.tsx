// components/modals/DeleteAll.tsx

import React from 'react';

interface DeleteAllProps {
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteAll: React.FC<DeleteAllProps> = ({ isLoading, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Delete All Transactions</h3>
        <p className="text-[var(--text-secondary)]">
          Are you sure you want to delete all transactions in this portfolio? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete All'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAll;
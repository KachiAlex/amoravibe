import React from "react";

export default function SettingsDeleteModal({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
        <button type="button" className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl" onClick={onCancel} aria-label="Close">&times;</button>
        <h2 className="font-bold text-2xl mb-4 text-red-600">Delete Account</h2>
        <p className="mb-6 text-gray-700">Are you sure you want to delete your account? This action cannot be undone.</p>
        <div className="flex gap-4 justify-end">
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full" onClick={onCancel}>Cancel</button>
          <button className="bg-red-500 text-white px-4 py-2 rounded-full" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
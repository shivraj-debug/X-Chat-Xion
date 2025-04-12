import { FC } from "react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">
        <h2 className="text-xl font-bold mb-2 text-center text-gray-800">You're out of messages!</h2>
        <p className="text-center text-gray-600 mb-4">
          Click below to upgrade your plan and get more credits.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-black rounded-xl hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Redirect to plan page
              window.location.href = "/plans"; // or your actual route
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Upgrade plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;

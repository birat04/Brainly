
interface CreateContentModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateContentModal({ open, onClose }: CreateContentModalProps) {
  if (!open) return null;

  return (
    <div className="w-screen h-screen fixed bg-red-200 top-0 left-0 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-lg font-bold mb-4">Create New Content</h2>
        <button
          className="px-4 py-2 bg-black text-white rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

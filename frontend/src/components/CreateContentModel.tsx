import { useState } from "react";
import { CrossIcon } from "../icons/CrossIcon";

interface CreateContentModalProps {
  open: boolean;
  onClose: () => void;
  onCreate?: (newContent: {
    title: string;
    link: string;
    type: "video" | "article" | "image";
  }) => void;
  onDelete?: (index: number) => void;
}

export function CreateContentModal({ open, onClose, onCreate, onDelete}: CreateContentModalProps) {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [type, setType] = useState<"video" | "article" | "image">("video");

  if (!open) return null;

  const handleSubmit = () => {
    if (!title || !link) return alert("Please fill all fields");

    onCreate?.({ title, link, type });
    onDelete?.(0);
    onClose();
    setTitle("");
    setLink("");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-40 z-40" />

      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <div className="flex justify-end mb-2">
            <button onClick={onClose}>
              <CrossIcon />
            </button>
          </div>

          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Link" value={link} onChange={(e) => setLink(e.target.value)} />

          <select
            className="w-full px-4 py-2 border rounded-md mb-4"
            value={type}
            onChange={(e) => setType(e.target.value as "video" | "article" | "image")}
          >
            <option value="video">Video</option>
            <option value="article">Article</option>
            <option value="image">Image</option>
          </select>

          <button
            onClick={handleSubmit}
            className="w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Add Content
          </button>
        </div>
      </div>
    </>
  );
}

function Input({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="px-4 py-2 border rounded-md w-full"
      />
    </div>
  );
}

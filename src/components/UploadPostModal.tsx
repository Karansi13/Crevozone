import React, { useState } from 'react';

interface UploadPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (content: string, media?: string[]) => void;
}

const UploadPostModal: React.FC<UploadPostModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<string[]>([]);

  const handleSubmit = () => {
    onUpload(content, media);
    setContent('');
    setMedia([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create a New Post</h2>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write something..."
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="file"
          multiple
          onChange={(e) => {
            const files = e.target.files;
            if (files) {
              const urls = Array.from(files).map((file) => URL.createObjectURL(file));
              setMedia(urls);
            }
          }}
          className="mb-4"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded">
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPostModal;
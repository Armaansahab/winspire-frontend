import React from 'react';

const CreatePostModal = ({ isOpen, onClose, onSubmit, value, onChange, user }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <h2 className="text-lg font-semibold text-white">New Post</h2>
          <button
            onClick={onSubmit}
            disabled={!value.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1 rounded-lg font-semibold text-sm transition-colors"
          >
            Share
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex-shrink-0"></div>
            <div>
              <p className="font-semibold text-white text-sm">{user?.fullName || 'Your Name'}</p>
              <p className="text-gray-400 text-xs">Public</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <textarea
              value={value}
              onChange={onChange}
              placeholder="What's on your mind?"
              className="w-full bg-transparent text-white placeholder-gray-400 resize-none h-32 text-lg focus:outline-none"
              maxLength={2200}
              autoFocus
            />
          </form>

          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {value.length}/2200 characters
            </span>
          </div>

          <div className="mt-4 p-3 border border-gray-700 rounded-lg">
            <p className="text-white text-sm mb-3">Add to your post</p>
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <button 
                  type="button"
                  className="w-8 h-8 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
                  title="Add Photo/Video"
                >
                  <span className="text-white text-sm">📷</span>
                </button>
                <button 
                  type="button"
                  className="w-8 h-8 bg-yellow-600 hover:bg-yellow-700 rounded-full flex items-center justify-center transition-colors"
                  title="Add Emoji"
                >
                  <span className="text-white text-sm">😊</span>
                </button>
                <button 
                  type="button"
                  className="w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
                  title="Add Location"
                >
                  <span className="text-white text-sm">📍</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
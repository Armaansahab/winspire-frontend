import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Camera } from 'lucide-react';

const InstagramPost = ({ post, user, onLike, onComment }) => {
  const [commentText, setCommentText] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(post._id, commentText);
      setCommentText('');
    }
  };

  const isPostLiked = () => {
    return post.likes && post.likes.includes(user?.id);
  };

  const formatTime = (dateString) => {
    const now = new Date();
    const postTime = new Date(dateString);
    const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return postTime.toLocaleDateString();
  };

  const commentsToShow = showAllComments ? post.comments : post.comments?.slice(-2) || [];

  return (
    <div className="border-b border-gray-800 bg-black">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full p-0.5">
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm text-white">{post.author?.username || 'Unknown User'}</p>
            <p className="text-gray-500 text-xs">{formatTime(post.createdAt)}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full h-80 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
        {post.image ? (
          <img src={post.image} alt="Post" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-white relative z-10">
            <Camera className="w-12 h-12 mx-auto mb-2 opacity-60" />
            <p className="text-sm opacity-80">Photo</p>
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onLike(post._id)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <Heart 
                className={`w-6 h-6 transition-colors ${
                  isPostLiked() 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-white hover:text-gray-300'
                }`} 
              />
            </button>
            <button className="hover:text-gray-300 transition-colors">
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="hover:text-gray-300 transition-colors">
              <Send className="w-6 h-6" />
            </button>
          </div>
          <button className="hover:text-gray-300 transition-colors">
            <Bookmark className="w-6 h-6" />
          </button>
        </div>

        {post.likes && post.likes.length > 0 && (
          <p className="font-semibold text-sm mb-2 text-white">
            {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
          </p>
        )}

        <div className="mb-2">
          <span className="font-semibold text-sm mr-2 text-white">{post.author?.username}</span>
          <span className="text-sm text-white">{post.content}</span>
        </div>

        {post.comments && post.comments.length > 0 && (
          <div className="space-y-2 mb-3">
            {post.comments.length > 2 && !showAllComments && (
              <button
                onClick={() => setShowAllComments(true)}
                className="text-gray-500 text-sm hover:text-gray-300 transition-colors"
              >
                View all {post.comments.length} comments
              </button>
            )}
            
            {commentsToShow.map((comment, index) => (
              <div key={comment._id || index} className="text-sm">
                <span className="font-semibold mr-2 text-white">
                  {comment.user?.username || 'Unknown'}
                </span>
                <span className="text-white">{comment.text}</span>
                <span className="text-gray-500 text-xs ml-2">
                  {formatTime(comment.createdAt)}
                </span>
              </div>
            ))}

            {showAllComments && post.comments.length > 2 && (
              <button
                onClick={() => setShowAllComments(false)}
                className="text-gray-500 text-sm hover:text-gray-300 transition-colors"
              >
                Hide comments
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3 pt-2 border-t border-gray-800">
          <div className="w-6 h-6 bg-gray-600 rounded-full flex-shrink-0"></div>
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder-gray-500 text-white"
            maxLength={500}
          />
          {commentText.trim() && (
            <button
              type="submit"
              className="text-blue-500 hover:text-blue-400 font-semibold text-sm transition-colors"
            >
              Post
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default InstagramPost;
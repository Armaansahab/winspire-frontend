import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Search, Home, Compass, Film, Users, Plus, Camera, X } from 'lucide-react';
import io from 'socket.io-client';

const InstagramHome = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
      window.location.href = '/ilogin';
      return;
    }

    setUser(userData);

    const socketConnection = io('http://localhost:5000');
    setSocket(socketConnection);
    socketConnection.emit('joinRoom', 'instagram');

    fetchPosts(token);

    socketConnection.on('newPost', (post) => {
      console.log('New Instagram post received:', post);
      if (post.platform === 'instagram') {
        setPosts(prev => {
          const existingPost = prev.find(p => p._id === post._id);
          if (existingPost) return prev;
          return [post, ...prev];
        });
      }
    });

    socketConnection.on('postLiked', ({ postId, likes }) => {
      console.log('Instagram post liked:', postId, likes);
      setPosts(prev => prev.map(post =>
        post._id === postId ? { ...post, likes } : post
      ));
    });

    socketConnection.on('newComment', ({ postId, comment }) => {
      console.log('New Instagram comment received:', postId, comment);
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          const existingComment = post.comments.find(c => c._id === comment._id);
          if (existingComment) return post;
          return { ...post, comments: [...post.comments, comment] };
        }
        return post;
      }));
    });

    socketConnection.on('postShared', ({ postId, shares }) => {
      console.log('Instagram post shared:', postId, shares);
      setPosts(prev => prev.map(post =>
        post._id === postId ? { ...post, shares } : post
      ));
    });

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const fetchPosts = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/posts/instagram', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }

      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() && !selectedImage) return;

    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      let imageUrl = '';

      if (selectedImage) {
        imageUrl = await convertToBase64(selectedImage);
      }

      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newPost,
          platform: 'instagram',
          image: imageUrl
        })
      });

      if (response.ok) {
        const newPostData = await response.json();
        console.log('Instagram post created successfully:', newPostData);
        setNewPost('');
        setSelectedImage(null);
        setImagePreview(null);
      } else {
        console.error('Failed to create Instagram post:', response.statusText);
        alert('Failed to create post. Please try again.');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

const handleLike = async (postId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      console.log('Like request successful');
    }
  } catch (error) {
    console.error('Error liking post:', error);
  }
};

  const handleComment = async (postId, commentText) => {
    if (!commentText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: commentText })
      });

      if (response.ok) {
        const newComment = await response.json();
        console.log('Instagram comment posted successfully:', newComment);
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      } else {
        console.error('Failed to post Instagram comment:', response.statusText);
      }
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  const handleCommentInputChange = (postId, value) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const formatTime = (dateString) => {
    const now = new Date();
    const postTime = new Date(dateString);
    const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const isLikedByUser = (post) => {
    return post.likes.some(likeId => likeId.toString() === user?.id?.toString());
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Instagram</h1>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Search className="w-6 h-6" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Heart className="w-6 h-6" />
            </button>
            <button 
              onClick={handleLogout}
              className="w-8 h-8 bg-gray-300 rounded-full hover:bg-gray-400 flex items-center justify-center text-xs font-semibold"
            >
              {user?.fullName?.charAt(0)?.toUpperCase()}
            </button>
          </div>
        </div>
      </header>

      <div className="pt-16 flex max-w-6xl mx-auto">
        <div className="flex-1 max-w-lg mx-auto">
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {user?.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                    rows={3}
                    maxLength={2200}
                  />
                </div>
              </div>

              {imagePreview && (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full max-h-96 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-white rounded-full p-2 hover:bg-opacity-100 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center space-x-2 px-4 py-2 text-pink-500 hover:bg-pink-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-sm font-medium">Photo</span>
                  </label>
                  
                  {newPost && (
                    <span className="text-xs text-gray-500">
                      {newPost.length}/2200 characters
                    </span>
                  )}
                </div>

                <button
                  onClick={handleCreatePost}
                  disabled={(!newPost.trim() && !selectedImage) || isUploading}
                  className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Posting...</span>
                    </>
                  ) : (
                    <span>Post</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            {posts.map((post) => (
              <div key={post._id} className="border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold">
                      {post.author.fullName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{post.author.username}</p>
                      <p className="text-xs text-gray-500">{formatTime(post.createdAt)}</p>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded-full">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {post.image ? (
                  <div className="w-full">
                    <img 
                      src={post.image} 
                      alt="Post content" 
                      className="w-full aspect-square object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="bg-gray-100 aspect-square hidden items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <span>Image not available</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 aspect-square flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <span>No image</span>
                    </div>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => handleLike(post._id)}
                        className="hover:scale-110 transition-transform"
                      >
                        <Heart 
                          className={`w-6 h-6 ${isLikedByUser(post) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-black hover:text-gray-600'
                          }`} 
                        />
                      </button>
                      <button 
                        onClick={() => toggleComments(post._id)}
                        className="hover:scale-110 transition-transform"
                      >
                        <MessageCircle className="w-6 h-6" />
                      </button>
                      <button className="hover:scale-110 transition-transform">
                        <Send className="w-6 h-6" />
                      </button>
                    </div>
                    <button className="hover:scale-110 transition-transform">
                      <Bookmark className="w-6 h-6" />
                    </button>
                  </div>

                  <p className="font-semibold text-sm mb-2">{post.likes.length} likes</p>

                  {post.content && (
                    <div className="mb-2">
                      <span className="font-semibold text-sm mr-2">{post.author.username}</span>
                      <span className="text-sm">{post.content}</span>
                    </div>
                  )}

                  {post.comments.length > 0 && (
                    <button 
                      onClick={() => toggleComments(post._id)}
                      className="text-sm text-gray-500 mb-2 hover:text-gray-700"
                    >
                      View all {post.comments.length} comments
                    </button>
                  )}

                  {showComments[post._id] && (
                    <div className="mt-3 space-y-2">
                      {post.comments.map((comment) => (
                        <div key={comment._id} className="flex items-start space-x-2">
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold">
                            {comment.user.fullName?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold text-sm mr-2">{comment.user.username}</span>
                            <span className="text-sm">{comment.text}</span>
                            <p className="text-xs text-gray-500 mt-1">{formatTime(comment.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center mt-4 pt-3 border-t border-gray-100">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentInputs[post._id] || ''}
                      onChange={(e) => handleCommentInputChange(post._id, e.target.value)}
                      className="flex-1 text-sm outline-none placeholder-gray-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleComment(post._id, commentInputs[post._id] || '');
                        }
                      }}
                    />
                    <button
                      onClick={() => handleComment(post._id, commentInputs[post._id] || '')}
                      disabled={!commentInputs[post._id]?.trim()}
                      className="text-blue-500 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm ml-2"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:block w-80 p-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center text-lg font-semibold">
                {user?.fullName?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{user?.username}</p>
                <p className="text-sm text-gray-500">{user?.fullName}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500 font-semibold">Suggestions for you</p>
                <button className="text-xs font-semibold">See All</button>
              </div>
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold">
                        U{i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">user{i + 1}</p>
                        <p className="text-xs text-gray-500">Suggested for you</p>
                      </div>
                    </div>
                    <button className="text-xs text-blue-500 font-semibold">Follow</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-3">
          <Home className="w-6 h-6" />
          <Search className="w-6 h-6" />
          <Plus className="w-6 h-6" />
          <Heart className="w-6 h-6" />
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
        </div>
      </nav>
    </div>
  );
};

export default InstagramHome;
import React, { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share, ThumbsUp, MoreHorizontal, Search, Home, Users, Play, Bell, Menu, Camera, X } from 'lucide-react';
import io from 'socket.io-client';

const FacebookHome = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
const [imagePreview, setImagePreview] = useState(null);
const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
      window.location.href = '/flogin';
      return;
    }
    
    setUser(userData);

    const socketConnection = io('https://winspire-backend-1.onrender.com');
    setSocket(socketConnection);
    socketConnection.emit('joinRoom', 'facebook');

    fetchPosts(token);

    socketConnection.on('newPost', (post) => {
      console.log('New Facebook post received:', post);
      if (post.platform === 'facebook') {
        setPosts(prev => {
          const existingPost = prev.find(p => p._id === post._id);
          if (existingPost) {
            console.log('Duplicate Facebook post detected, skipping:', post._id);
            return prev;
          }
          console.log('Adding new Facebook post to feed:', post._id);
          return [post, ...prev];
        });
      }
    });

    socketConnection.on('postLiked', ({ postId, likes }) => {
      console.log('Facebook post liked:', postId, likes);
      setPosts(prev => prev.map(post => 
        post._id === postId ? { ...post, likes } : post
      ));
    });

    socketConnection.on('newComment', ({ postId, comment }) => {
      console.log('New Facebook comment received:', postId, comment);
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
      console.log('Facebook post shared:', postId, shares);
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
      const response = await fetch('https://winspire-backend-1.onrender.com/api/posts/facebook', {
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

const handleCreatePost = async () => {
  if (!newPost.trim() && !selectedImage) return;

  setIsUploading(true);
  try {
    const token = localStorage.getItem('token');
    let imageUrl = '';

    if (selectedImage) {
      imageUrl = await convertToBase64(selectedImage);
    }

    const response = await fetch('https://winspire-backend-1.onrender.com/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        content: newPost,
        platform: 'facebook',
        image: imageUrl
      })
    });

    if (response.ok) {
      const newPostData = await response.json();
      console.log('Facebook post created successfully:', newPostData);
      setNewPost('');
      setSelectedImage(null);
      setImagePreview(null);
    } else {
      console.error('Failed to create Facebook post:', response.statusText);
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
      const response = await fetch(`https://winspire-backend-1.onrender.com/api/posts/${postId}/like`, {
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

  const handleShare = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://winspire-backend-1.onrender.com/api/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(prev => prev.map(post =>
          post._id === postId ? { ...post, shares: data.shares } : post
        ));
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleComment = async (postId, commentText) => {
    if (!commentText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://winspire-backend-1.onrender.com/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: commentText })
      });

      if (response.ok) {
        const newComment = await response.json();
        console.log('Facebook comment posted successfully:', newComment);
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      } else {
        console.error('Failed to post Facebook comment:', response.statusText);
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
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return postTime.toLocaleDateString();
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

  const isLikedByUser = (post) => {
    return post.likes.some(likeId => likeId.toString() === user?.id?.toString());
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 border-b">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-blue-600">facebook</h1>
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Facebook"
                className="pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-60"
              />
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-2">
            <button className="p-3 rounded-lg hover:bg-gray-100 text-blue-600">
              <Home className="w-6 h-6" />
            </button>
            <button className="p-3 rounded-lg hover:bg-gray-100 text-gray-600">
              <Users className="w-6 h-6" />
            </button>
            <button className="p-3 rounded-lg hover:bg-gray-100 text-gray-600">
              <Play className="w-6 h-6" />
            </button>
          </nav>

          <div className="flex items-center space-x-2">
            <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
              <Menu className="w-5 h-5" />
            </button>
            <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
              <MessageCircle className="w-5 h-5" />
            </button>
            <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
              <Bell className="w-5 h-5" />
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

      <div className="pt-20 flex max-w-6xl mx-auto">
        <div className="hidden lg:block w-80 p-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200 cursor-pointer">
              <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">
                {user?.fullName?.charAt(0)?.toUpperCase()}
              </div>
              <span className="font-medium">{user?.fullName}</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200 cursor-pointer">
              <Users className="w-9 h-9 text-blue-600" />
              <span>Friends</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200 cursor-pointer">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span>Groups</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200 cursor-pointer">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-blue-600" />
              </div>
              <span>Watch</span>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex space-x-2 overflow-x-auto">
              <div className="relative min-w-max">
                <div className="w-28 h-40 bg-gray-200 rounded-lg flex flex-col items-center justify-end p-2 cursor-pointer">
                  <div className="absolute top-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">+</span>
                  </div>
                  <span className="text-xs font-medium">Create Story</span>
                </div>
              </div>
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="min-w-max">
                  <div className="w-28 h-40 bg-gray-300 rounded-lg relative cursor-pointer">
                    <div className="absolute top-2 left-2 w-8 h-8 bg-blue-600 rounded-full border-4 border-white"></div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="text-white text-xs font-medium">Friend {i + 1}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
  <div className="flex items-start space-x-3 mb-3">
    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">
      {user?.fullName?.charAt(0)?.toUpperCase()}
    </div>
    <div className="flex-1">
      <textarea
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        placeholder={`What's on your mind, ${user?.fullName?.split(' ')[0]}?`}
        className="w-full bg-gray-100 rounded-lg px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        rows={3}
        maxLength={2200}
      />
    </div>
  </div>

  {imagePreview && (
    <div className="relative mb-3">
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

  <hr className="my-3" />
  
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-6">
      <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg">
        <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
          <Play className="w-3 h-3 text-white fill-current" />
        </div>
        <span className="text-sm font-medium">Live video</span>
      </button>
      
      <input
        type="file"
        id="facebook-image-upload"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
      <label
        htmlFor="facebook-image-upload"
        className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg cursor-pointer"
      >
        <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
          <Camera className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm font-medium">Photo/video</span>
      </label>
    </div>
    
    <button
      onClick={handleCreatePost}
      disabled={(!newPost.trim() && !selectedImage) || isUploading}
      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
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

          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg shadow-sm">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">
                      {post.author.fullName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{post.author.fullName}</p>
                      <p className="text-sm text-gray-500">{formatTime(post.createdAt)}</p>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded-full">
                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="px-4 pb-3">
                  <p className="text-gray-900">{post.content}</p>
                </div>

{post.image ? (
  <div className="w-full">
    <img 
      src={post.image} 
      alt="Post content" 
      className="w-full max-h-96 object-cover"
      onError={(e) => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
    />
    <div className="bg-gray-200 h-64 hidden items-center justify-center">
      <div className="text-center text-gray-500">
        <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <span>Image not available</span>
      </div>
    </div>
  </div>
) : null}

                <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <div className="flex -space-x-1">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <ThumbsUp className="w-3 h-3 text-white fill-current" />
                      </div>
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <Heart className="w-3 h-3 text-white fill-current" />
                      </div>
                    </div>
                    <span>{post.likes.length}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => toggleComments(post._id)}
                      className="hover:underline"
                    >
                      {post.comments.length} comments
                    </button>
                    <span>{post.shares} shares</span>
                  </div>
                </div>

                <hr />

                <div className="p-2 flex items-center justify-around">
                  <button 
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                      isLikedByUser(post) ? 'text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    <ThumbsUp className={`w-5 h-5 ${isLikedByUser(post) ? 'fill-current' : ''}`} />
                    <span className="font-medium">Like</span>
                  </button>
                  
                  <button 
                    onClick={() => toggleComments(post._id)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">Comment</span>
                  </button>
                  
                  <button 
                    onClick={() => handleShare(post._id)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    <Share className="w-5 h-5" />
                    <span className="font-medium">Share</span>
                  </button>
                </div>

                {showComments[post._id] && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 mt-3 mb-4">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold">
                        {user?.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentInputs[post._id] || ''}
                          onChange={(e) => handleCommentInputChange(post._id, e.target.value)}
                          className="w-full bg-transparent text-sm outline-none placeholder-gray-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleComment(post._id, commentInputs[post._id] || '');
                            }
                          }}
                        />
                      </div>
                      <button
                        onClick={() => handleComment(post._id, commentInputs[post._id] || '')}
                        disabled={!commentInputs[post._id]?.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                      >
                        Post
                      </button>
                    </div>

                    <div className="space-y-2">
                      {post.comments.map((comment) => (
                        <div key={comment._id} className="flex items-start space-x-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold">
                            {comment.user.fullName?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="bg-gray-100 rounded-2xl px-3 py-2 flex-1">
                            <p className="font-medium text-sm">{comment.user.fullName}</p>
                            <p className="text-sm">{comment.text}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatTime(comment.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="hidden xl:block w-80 p-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Contacts</h3>
            <div className="space-y-3">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">
                      F{i + 1}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-sm font-medium">Friend {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacebookHome;
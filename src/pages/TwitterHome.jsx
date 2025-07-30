import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Search, Bell, Mail } from 'lucide-react';
import io from 'socket.io-client';

const TwitterHome = () => {
  const [posts, setPosts] = useState([]);
  const [newTweet, setNewTweet] = useState('');
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
      window.location.href = '/tlogin';
      return;
    }

    setUser(userData);

    const socketConnection = io('http://localhost:5000');
    setSocket(socketConnection);
    socketConnection.emit('joinRoom', 'twitter');

    fetchPosts(token);

    socketConnection.on('newPost', (post) => {
      console.log('New Twitter post received:', post);
      if (post.platform === 'twitter') {
        setPosts(prev => {
          const existingPost = prev.find(p => p._id === post._id);
          if (existingPost) {
            console.log('Duplicate post detected, skipping:', post._id);
            return prev;
          }
          console.log('Adding new post to feed:', post._id);
          return [post, ...prev];
        });
      }
    });

    socketConnection.on('postLiked', ({ postId, likes }) => {
      console.log('Post liked:', postId, likes);
      setPosts(prev => prev.map(post =>
        post._id === postId ? { ...post, likes } : post
      ));
    });

    socketConnection.on('newComment', ({ postId, comment }) => {
      console.log('New comment received:', postId, comment);
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
      console.log('Post shared:', postId, shares);
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
      const response = await fetch('http://localhost:5000/api/posts/twitter', {
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

  const handleTweet = async () => {
    if (!newTweet.trim() || newTweet.length > 280) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newTweet,
          platform: 'twitter'
        })
      });

      if (response.ok) {
        const newPost = await response.json();
        console.log('Tweet posted successfully:', newPost);
        setNewTweet('');
      } else {
        console.error('Failed to post tweet:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating tweet:', error);
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

  const handleRetweet = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/share`, {
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
      console.error('Error retweeting:', error);
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
        console.log('Comment posted successfully:', newComment);
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      } else {
        console.error('Failed to post comment:', response.statusText);
      }
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentInputChange = (postId, value) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: value
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
    const diffInSeconds = Math.floor((now - postTime) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return postTime.toLocaleDateString();
  };

  const isLikedByUser = (post) => {
    return post.likes && post.likes.some(likeId => likeId.toString() === user?.id?.toString());
  };

  const trendingTopics = [
    { topic: '#TechNews', posts: '125K posts' },
    { topic: '#WebDevelopment', posts: '89K posts' },
    { topic: '#React', posts: '67K posts' },
    { topic: '#JavaScript', posts: '154K posts' },
    { topic: '#AI', posts: '98K posts' }
  ];

  const suggestedFollows = [
    { name: 'Tech News', username: 'technews', verified: true },
    { name: 'Web Dev Tips', username: 'webdevtips', verified: false },
    { name: 'React Official', username: 'reactjs', verified: true },
    { name: 'JavaScript Daily', username: 'jsdaily', verified: false }
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className="fixed left-0 top-0 h-full w-64 p-4 border-r border-gray-800 hidden lg:block">
        <div className="mb-8">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>

        <nav className="space-y-2">
          <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-900 cursor-pointer">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.46 7.57L12.357 2.115a.5.5 0 00-.714 0L1.54 7.57A1 1 0 001 8.5v9a2 2 0 002 2h3.5a.5.5 0 00.5-.5v-7a.5.5 0 01.5-.5h5a.5.5 0 01.5.5v7a.5.5 0 00.5.5H17a2 2 0 002-2v-9a1 1 0 00-.54-.93z" />
            </svg>
            <span className="text-xl">Home</span>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-900 cursor-pointer">
            <Search className="w-6 h-6" />
            <span className="text-xl">Explore</span>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-900 cursor-pointer">
            <Bell className="w-6 h-6" />
            <span className="text-xl">Notifications</span>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-900 cursor-pointer">
            <Mail className="w-6 h-6" />
            <span className="text-xl">Messages</span>
          </div>
        </nav>

        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full mt-8 transition-colors"
        >
          Post
        </button>

        <div className="mt-auto pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-900 cursor-pointer w-full"
          >
            <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
            <div className="flex-1 text-left">
              <p className="font-bold">{user?.fullName || 'User'}</p>
              <p className="text-gray-500">@{user?.username || 'username'}</p>
            </div>
          </button>
        </div>
      </div>

      <div className="flex-1 lg:ml-64 lg:mr-80 border-x border-gray-800 min-h-screen">
        <header className="sticky top-0 bg-black/80 backdrop-blur border-b border-gray-800 p-4">
          <h1 className="text-xl font-bold">Home</h1>
        </header>

        <div className="border-b border-gray-800 p-4">
          <div className="flex space-x-3">
            <div className="w-12 h-12 bg-gray-600 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <textarea
                value={newTweet}
                onChange={(e) => setNewTweet(e.target.value)}
                placeholder="What's happening?"
                className="w-full bg-transparent text-xl placeholder-gray-500 resize-none outline-none"
                rows={3}
                maxLength={280}
              />
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4 text-blue-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3z" />
                  </svg>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.708 2.292A1 1 0 0 0 18.708 2H5.292A3 3 0 0 0 2.292 5v14a3 3 0 0 0 3 3h13.416a1 1 0 0 0 1-1V3a1 1 0 0 0-.292-.708z" />
                  </svg>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm ${newTweet.length > 260 ? 'text-red-500' : 'text-gray-500'}`}>
                    {280 - newTweet.length}
                  </span>
                  <button
                    onClick={handleTweet}
                    disabled={!newTweet.trim() || newTweet.length > 280}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-full transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          {posts.map((post) => (
            <div key={post._id} className="border-b border-gray-800 p-4 hover:bg-gray-950/50 transition-colors">
              <div className="flex space-x-3">
                <div className="w-12 h-12 bg-gray-600 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-bold">{post.author?.fullName || 'Unknown User'}</span>
                    <span className="text-gray-500">@{post.author?.username || 'unknown'}</span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-500">{formatTime(post.createdAt)}</span>
                    <div className="ml-auto">
                      <MoreHorizontal className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-white whitespace-pre-wrap">{post.content}</p>
                  </div>

                  <div className="flex items-center justify-between max-w-md">
                    <button
                      className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors group"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComments(post._id);
                      }}
                    >
                      <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <span className="text-sm">{post.comments?.length || 0}</span>
                    </button>

                    <button
                      className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors group"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRetweet(post._id);
                      }}
                    >
                      <div className="p-2 rounded-full group-hover:bg-green-500/10">
                        <Repeat2 className="w-5 h-5" />
                      </div>
                      <span className="text-sm">{post.shares || 0}</span>
                    </button>

                    <button
                      className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors group"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(post._id);
                      }}
                    >
                      <div className="p-2 rounded-full group-hover:bg-red-500/10">
                        <Heart
                          className={`w-5 h-5 ${isLikedByUser(post)
                              ? 'fill-red-500 text-red-500'
                              : ''
                            }`}
                        />
                      </div>
                      <span className="text-sm">{post.likes?.length || 0}</span>
                    </button>

                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors group">
                      <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                        <Share className="w-5 h-5" />
                      </div>
                    </button>
                  </div>

                  {showComments[post._id] && (
                    <div className="mt-4 border-t border-gray-800 pt-4">
                      <div className="flex space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Post your reply"
                            value={commentInputs[post._id] || ''}
                            onChange={(e) => handleCommentInputChange(post._id, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleComment(post._id, commentInputs[post._id] || '');
                              }
                            }}
                            className="w-full bg-transparent border border-gray-700 rounded-full px-4 py-2 text-sm outline-none focus:border-blue-500"
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={() => handleComment(post._id, commentInputs[post._id] || '')}
                              disabled={!commentInputs[post._id]?.trim()}
                              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-1 px-4 rounded-full text-sm transition-colors"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {post.comments?.map((comment) => (
                          <div key={comment._id} className="flex space-x-3">
                            <div className="w-8 h-8 bg-gray-600 rounded-full flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-bold text-sm">{comment.user?.fullName || 'Unknown User'}</span>
                                <span className="text-gray-500 text-sm">@{comment.user?.username || 'unknown'}</span>
                                <span className="text-gray-500 text-sm">·</span>
                                <span className="text-gray-500 text-sm">{formatTime(comment.createdAt)}</span>
                              </div>
                              <p className="text-sm">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed right-0 top-0 h-full w-80 p-4 hidden lg:block overflow-y-auto">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search Twitter"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-black"
            />
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-4 mb-4">
          <h2 className="text-xl font-bold mb-2">Subscribe to Premium</h2>
          <p className="text-gray-400 text-sm mb-3">Subscribe to unlock new features and if eligible, receive a share of revenue.</p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-colors">
            Subscribe
          </button>
        </div>

        <div className="bg-gray-900 rounded-2xl p-4 mb-4">
          <h2 className="text-xl font-bold mb-4">What's happening</h2>
          <div className="space-y-3">
            {trendingTopics.map((trend, index) => (
              <div key={index} className="hover:bg-gray-800 rounded-lg p-2 cursor-pointer transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-500 text-sm">Trending</p>
                    <p className="font-bold">{trend.topic}</p>
                    <p className="text-gray-500 text-sm">{trend.posts}</p>
                  </div>
                  <MoreHorizontal className="w-5 h-5 text-gray-500" />
                </div>
              </div>
            ))}
          </div>
          <button className="text-blue-500 hover:underline mt-3">Show more</button>
        </div>

        <div className="bg-gray-900 rounded-2xl p-4">
          <h2 className="text-xl font-bold mb-4">Who to follow</h2>
          <div className="space-y-3">
            {suggestedFollows.map((user, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="font-bold">{user.name}</span>
                      {user.verified && (
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">@{user.username}</p>
                  </div>
                </div>
                <button className="bg-white text-black font-bold py-1.5 px-4 rounded-full text-sm hover:bg-gray-200 transition-colors">
                  Follow
                </button>
              </div>
            ))}
          </div>
          <button className="text-blue-500 hover:underline mt-3">Show more</button>
        </div>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800">
        <div className="flex items-center justify-around py-3">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.46 7.57L12.357 2.115a.5.5 0 00-.714 0L1.54 7.57A1 1 0 001 8.5v9a2 2 0 002 2h3.5a.5.5 0 00.5-.5v-7a.5.5 0 01.5-.5h5a.5.5 0 01.5.5v7a.5.5 0 00.5.5H17a2 2 0 002-2v-9a1 1 0 00-.54-.93z" />
          </svg>
          <Search className="w-6 h-6" />
          <Bell className="w-6 h-6" />
          <Mail className="w-6 h-6" />
        </div>
      </nav>
    </div>
  )
}

export default TwitterHome;
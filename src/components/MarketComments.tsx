'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, ThumbsUp, Send } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
  liked: boolean;
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    username: 'PolitikWatcher',
    avatar: 'P',
    text: 'Menurut saya probabilitasnya akan naik setelah debat terakhir. Data polling terbaru menunjukkan tren positif.',
    timestamp: '2026-02-04T10:30:00',
    likes: 12,
    liked: false,
  },
  {
    id: '2',
    username: 'DataDriven',
    avatar: 'D',
    text: 'Perlu dicatat bahwa historical data menunjukkan pola yang serupa di event sebelumnya.',
    timestamp: '2026-02-03T15:45:00',
    likes: 8,
    liked: false,
  },
  {
    id: '3',
    username: 'NusantaraTrader',
    avatar: 'N',
    text: 'Odds masih undervalued menurut analisis saya. Good entry point untuk yang mau masuk.',
    timestamp: '2026-02-02T09:20:00',
    likes: 5,
    liked: false,
  },
];

interface MarketCommentsProps {
  marketId: string;
}

export default function MarketComments({ marketId }: MarketCommentsProps) {
  const { isLoggedIn, user } = useStore();
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = () => {
    if (!newComment.trim() || !user) return;

    const comment: Comment = {
      id: Date.now().toString(),
      username: user.username,
      avatar: user.username.charAt(0).toUpperCase(),
      text: newComment.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
      liked: false,
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleLike = (id: string) => {
    setComments(comments.map(c =>
      c.id === id
        ? { ...c, likes: c.liked ? c.likes - 1 : c.likes + 1, liked: !c.liked }
        : c
    ));
  };

  const formatTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Baru saja';
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  };

  if (!mounted) return null;

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-primary-500" />
        <h3 className="text-white font-semibold text-lg">Diskusi</h3>
        <span className="text-dark-400 text-sm">({comments.length})</span>
      </div>

      {/* New Comment Input */}
      {isLoggedIn ? (
        <div className="flex gap-3 mb-6">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tulis komentar atau analisis Anda..."
              rows={2}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm placeholder-dark-500 focus:outline-none focus:border-primary-500 resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSubmit}
                disabled={!newComment.trim()}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  newComment.trim()
                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                    : 'bg-dark-700 text-dark-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                Kirim
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-dark-700/50 rounded-lg p-4 mb-6 text-center">
          <p className="text-dark-400 text-sm">
            <a href="/auth" className="text-primary-400 hover:text-primary-300">Masuk</a> untuk ikut berdiskusi
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-9 h-9 bg-dark-600 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {comment.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white text-sm font-medium">{comment.username}</span>
                <span className="text-dark-500 text-xs">{formatTime(comment.timestamp)}</span>
              </div>
              <p className="text-dark-300 text-sm leading-relaxed">{comment.text}</p>
              <button
                onClick={() => handleLike(comment.id)}
                className={`flex items-center gap-1 mt-2 text-xs transition-colors ${
                  comment.liked ? 'text-primary-400' : 'text-dark-500 hover:text-dark-300'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                {comment.likes > 0 && comment.likes}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

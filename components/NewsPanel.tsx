import React from 'react';
import { NewsItem } from '../types';
import { NewsCard } from './NewsCard';

interface NewsPanelProps {
  news: NewsItem[];
}

export const NewsPanel: React.FC<NewsPanelProps> = ({ news }) => {
  const recentNews = news.slice(0, 5); // Show latest 5 news items

  return (
    <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-cyan-300 tracking-wider">TIN TỨC & TRUYỀN THÔNG</h2>
      {recentNews.length > 0 ? (
        <div className="space-y-4">
          {recentNews.map(item => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic">Chưa có tin tức nào.</p>
      )}
    </div>
  );
};
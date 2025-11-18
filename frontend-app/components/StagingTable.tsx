// frontend-app/components/StagingTable.tsx
// (PHIÊN BẢN ĐÃ CẬP NHẬT - Hiển thị Source Type)

import React, { useState } from 'react';
import { Insight, Sentiment, Topic } from '../types';
import { MagicIcon } from './icons/MagicIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface StagingTableProps {
  insights: Insight[];
  onProcessInsight: (id: string, sentiment: Sentiment, topic: Topic) => void;
  onDeleteInsight: (id: string) => void;
  onGetSuggestions: (content: string) => Promise<{ sentiment: Sentiment; topic: Topic } | null>;
  onClearStaging: () => void;
}

// (MỚI) Hàm helper để tạo màu cho nhãn
const getSourceTypeColor = (sourceType: string | undefined) => {
  switch (sourceType) {
    case 'GNews':
      return 'bg-blue-600 text-blue-100';
    case 'Reddit':
      return 'bg-orange-600 text-orange-100';
    case 'YouTube':
      return 'bg-red-600 text-red-100';
    case 'Scraping':
      return 'bg-indigo-600 text-indigo-100';
    default:
      return 'bg-gray-600 text-gray-100';
  }
};

const StagingTableRow: React.FC<{ insight: Insight; onProcess: Function; onDelete: Function; onGetSuggestions: Function; }> = ({ insight, onProcess, onDelete, onGetSuggestions }) => {
  const [sentiment, setSentiment] = useState<Sentiment | ''>('');
  const [topic, setTopic] = useState<Topic | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGetSuggestion = async () => {
    setIsLoading(true);
    const suggestions = await onGetSuggestions(insight.raw_content);
    if (suggestions) {
      setSentiment(suggestions.sentiment);
      setTopic(suggestions.topic);
    }
    setIsLoading(false);
  };
  
  const canProcess = sentiment !== '' && topic !== '';

  // (Lấy danh sách Topic Enum, bao gồm cả "Product" mà chúng ta đã thêm)
  const topicOptions = Object.values(Topic);
  // (Lấy danh sách Sentiment Enum)
  const sentimentOptions = Object.values(Sentiment);

  return (
    <div className="bg-gray-800 p-4 rounded-lg space-y-3 border border-gray-700">
        <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
                {/* --- (THAY ĐỔI) Thêm Nhãn Source Type --- */}
                <div className="flex items-center space-x-2 mb-1">
                  <span 
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getSourceTypeColor(insight.source_type)}`}
                  >
                    {insight.source_type || 'Unknown'}
                  </span>
                  <p className="text-sm text-gray-400 truncate" title={insight.source_url}>
                    {insight.source_url}
                  </p>
                </div>
                {/* --- Hết thay đổi --- */}
                
                <p className="text-gray-200 mt-1 whitespace-pre-wrap break-words">
                  {insight.raw_content}
                </p>
            </div>
            <button onClick={() => onDelete(insight.id)} className="ml-4 text-gray-500 hover:text-red-500 transition-colors flex-shrink-0">
                <TrashIcon className="h-5 w-5"/>
            </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value as Sentiment)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
                <option value="" disabled>Select Sentiment</option>
                {/* (Cập nhật) Dùng biến đã khai báo */}
                {sentimentOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
                value={topic}
                onChange={(e) => setTopic(e.target.value as Topic)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
                <option value="" disabled>Select Topic</option>
                 {/* (Cập nhật) Dùng biến đã khai báo */}
                {topicOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
        </div>
        <div className="flex space-x-2">
             <button
                onClick={handleGetSuggestion}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-gray-500"
              >
                {isLoading ? <SpinnerIcon /> : <MagicIcon className="h-5 w-5 mr-2"/>}
                Suggest with AI
            </button>
            <button
                onClick={() => onProcess(insight.id, sentiment, topic)}
                disabled={!canProcess}
                className="flex-1 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-gray-500"
            >
                <CheckCircleIcon className="h-5 w-5 mr-2"/>
                Process
            </button>
        </div>
    </div>
  );
};

const StagingTable: React.FC<StagingTableProps> = ({ insights, onProcessInsight, onDeleteInsight, onGetSuggestions, onClearStaging }) => {
  if (!insights || insights.length === 0) {
    return (
      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 text-center">
        <h2 className="text-lg font-semibold text-white mb-2">Staging Area</h2>
        <p className="text-gray-400">No insights to process. Add new insights using the form.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Staging Area ({insights.length})</h2>
         <button
          onClick={onClearStaging}
          className="flex items-center text-sm bg-red-800 hover:bg-red-700 text-white font-medium py-1 px-3 rounded-md transition-colors duration-200"
        >
          <TrashIcon className="h-4 w-4 mr-1"/>
          Clear All
        </button>
      </div>
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
        {/* (Sắp xếp hiển thị mục mới nhất lên đầu) */}
        {insights.slice().reverse().map(insight => (
          <StagingTableRow
            key={insight.id}
            insight={insight}
            onProcess={onProcessInsight}
            onDelete={onDeleteInsight}
            onGetSuggestions={onGetSuggestions}
          />
        ))}
      </div>
    </div>
  );
};

export default StagingTable;
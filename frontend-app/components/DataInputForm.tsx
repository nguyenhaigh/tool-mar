
import React, { useState } from 'react';
import { PlusIcon } from './icons/PlusIcon';

interface DataInputFormProps {
  onAddInsight: (insightData: { source_url: string; raw_content: string }) => void;
}

const DataInputForm: React.FC<DataInputFormProps> = ({ onAddInsight }) => {
  const [sourceUrl, setSourceUrl] = useState('');
  const [rawContent, setRawContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceUrl.trim() && rawContent.trim()) {
      onAddInsight({ source_url: sourceUrl, raw_content: rawContent });
      setSourceUrl('');
      setRawContent('');
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
      <h2 className="text-lg font-semibold mb-4 text-white">Add New Insight</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="source_url" className="block text-sm font-medium text-gray-300 mb-1">Source URL</label>
          <input
            id="source_url"
            type="text"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="e.g., https://kenh14.vn/..."
            className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            required
          />
        </div>
        <div>
          <label htmlFor="raw_content" className="block text-sm font-medium text-gray-300 mb-1">Raw Content</label>
          <textarea
            id="raw_content"
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            rows={4}
            placeholder="Paste raw text or comment here..."
            className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-gray-500"
          disabled={!sourceUrl.trim() || !rawContent.trim()}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add to Staging
        </button>
      </form>
    </div>
  );
};

export default DataInputForm;

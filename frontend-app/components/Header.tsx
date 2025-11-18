
import React from 'react';
import { ChartBarIcon } from './icons/ChartBarIcon';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="flex items-center space-x-3">
        <ChartBarIcon className="h-8 w-8 text-cyan-400" />
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            The DA's Reliability Hub
          </h1>
          <p className="text-sm text-gray-400">
            Trung tâm Điều phối Insight Bán tự động
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;

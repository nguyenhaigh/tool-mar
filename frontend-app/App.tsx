// frontend-app/App.tsx
// (PHIÊN BẢN CUỐI CÙNG - Giai Đoạn 4.2 - Đã thêm Tabs)

import React, { useState, useCallback, useEffect } from 'react';
import { Insight, Sentiment, Topic } from './types';
import Header from './components/Header';
import DataInputForm from './components/DataInputForm';
import StagingTable from './components/StagingTable';
// (MỚI) Import component Quản lý Target
import TargetManager from './components/TargetManager';
import {
  getStagedInsights,
  getProcessedInsights,
  addInsight,
  processInsight,
  deleteStagedInsight,
  getAiSuggestion
} from './services/apiService';

// (MỚI) Định nghĩa các Tab
type AppTab = 'staging' | 'admin';

const App: React.FC = () => {
  // --- (MỚI) State cho Tab ---
  const [activeTab, setActiveTab] = useState<AppTab>('staging');

  // --- State cho Tab "Staging" (Giữ nguyên) ---
  const [stagedInsights, setStagedInsights] = useState<Insight[]>([]);
  const [error, setError] = useState<string | null>(null);

  // (processedInsights không còn được dùng trong App, 
  //  vì StagingTable chỉ cần stagedInsights)

  // --- Logic cho Tab "Staging" (Giữ nguyên) ---
  const loadStagingData = useCallback(async () => {
    try {
      setError(null);
      const staged = await getStagedInsights();
      setStagedInsights(staged);
    } catch (e: any) {
      console.error("Failed to load staging data:", e);
      setError(`Could not load staging data: ${e.message}`);
    }
  }, []);

  useEffect(() => {
    // Chỉ tải data staging khi tab này được kích hoạt
    if (activeTab === 'staging') {
      loadStagingData();
    }
  }, [loadStagingData, activeTab]);

  const handleAddInsight = useCallback(async (insightData: { source_url: string; raw_content: string }) => {
    try {
      await addInsight(insightData);
      await loadStagingData(); // Chỉ cần tải lại staging
    } catch (e: any) {
      setError(`Failed to add insight: ${e.message}`);
    }
  }, [loadStagingData]);

  const handleProcessInsight = useCallback(async (id: string, sentiment: Sentiment, topic: Topic) => {
    try {
      await processInsight(id, sentiment, topic);
      await loadStagingData();
    } catch (e: any) {
      setError(`Failed to process insight: ${e.message}`);
    }
  }, [loadStagingData]);

  const handleDeleteStagedInsight = useCallback(async (id: string) => {
    try {
      await deleteStagedInsight(id);
      await loadStagingData();
    } catch (e: any) {
      setError(`Failed to delete insight: ${e.message}`);
    }
  }, [loadStagingData]);

  const handleGetSuggestions = useCallback(async (content: string): Promise<{ sentiment: Sentiment; topic: Topic } | null> => {
    setError(null);
    try {
      const result = await getAiSuggestion(content);
      return result;
    } catch (e: any) {
      console.error("Error getting suggestions:", e);
      setError(`Failed to get AI suggestions: ${e.message}. Check backend API.`);
      return null;
    }
  }, []);

  // --- (MỚI) Component Tab Navigation ---
  const TabNavigation: React.FC = () => {
    const getTabClass = (tab: AppTab) =>
      activeTab === tab
        ? 'border-cyan-500 text-cyan-400'
        : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-500';

    return (
      <div className="border-b border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('staging')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${getTabClass('staging')}`}
          >
            Staging Area (Luồng 1)
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${getTabClass('admin')}`}
          >
            Target Management (Luồng 2)
          </button>
        </nav>
      </div>
    );
  };

  // --- (CẬP NHẬT) JSX Return ---
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Header />

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* (MỚI) Thêm Tab Navigation */}
        <TabNavigation />

        {/* (MỚI) Hiển thị nội dung dựa trên Tab đang active */}
        {activeTab === 'staging' && (
          <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <DataInputForm onAddInsight={handleAddInsight} />
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <h2 className="text-lg font-semibold mb-4 text-white">Processed Dashboard</h2>
                <p className="text-gray-400">Dashboard phân tích đã được chuyển sang Metabase.</p>
                <a
                  href="http://localhost:3001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md"
                >
                  Open Dashboard
                </a>
              </div>
            </div>
            <div className="lg:col-span-3">
              <StagingTable
                insights={stagedInsights}
                onProcessInsight={handleProcessInsight}
                onDeleteInsight={handleDeleteStagedInsight}
                onGetSuggestions={handleGetSuggestions}
                onClearStaging={() => { }} // Tạm thời
              />
            </div>
          </main>
        )}

        {activeTab === 'admin' && (
          <main>
            <TargetManager />
          </main>
        )}
      </div>
    </div>
  );
};

export default App;
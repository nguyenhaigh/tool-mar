// frontend-app/src/services/apiService.ts
// (PHIÊN BẢN CẬP NHẬT - Giai Đoạn 4.2)
import { Insight, Sentiment, Topic, Target, TargetType } from '../types';

// (MỚI) Chia API base URL ra
const API_BASE_URL = 'http://localhost:8080/api';

// Hàm xử lý phản hồi API chung
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Something went wrong');
  }
  // Xử lý trường hợp 204 No Content (cho lệnh DELETE)
  if (response.status === 204) {
    return {} as T;
  }
  return response.json();
}

// --- 1. Insights API (Luồng 1 & 3) ---
const INSIGHTS_API = `${API_BASE_URL}/insights`;

export async function getStagedInsights(): Promise<Insight[]> {
  const response = await fetch(`${INSIGHTS_API}/staged`);
  return handleResponse<Insight[]>(response);
}

export async function getProcessedInsights(): Promise<Insight[]> {
  const response = await fetch(`${INSIGHTS_API}/processed`);
  return handleResponse<Insight[]>(response);
}

export async function addInsight(insightData: { source_url: string; raw_content: string }): Promise<Insight> {
  const response = await fetch(`${INSIGHTS_API}/stage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(insightData),
  });
  return handleResponse<Insight>(response);
}

export async function processInsight(id: string, sentiment: Sentiment, topic: Topic): Promise<void> {
  const response = await fetch(`${INSIGHTS_API}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, sentiment, topic }),
  });
  await handleResponse<any>(response);
}

export async function deleteStagedInsight(id: string): Promise<void> {
  const response = await fetch(`${INSIGHTS_API}/stage/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<any>(response);
}

export async function getAiSuggestion(content: string): Promise<{ sentiment: Sentiment; topic: Topic }> {
  const response = await fetch(`${INSIGHTS_API}/suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  return handleResponse<{ sentiment: Sentiment; topic: Topic }>(response);
}

// --- 2. Target Management API (Luồng 2 - Giai Đoạn 4) ---
const TARGETS_API = `${API_BASE_URL}/targets`;

export async function getTargets(): Promise<Target[]> {
  const response = await fetch(TARGETS_API);
  return handleResponse<Target[]>(response);
}

export async function createTarget(data: {
  target_name: string;
  target_type: TargetType;
  target_value: string;
}): Promise<Target> {
  const response = await fetch(TARGETS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Target>(response);
}

export async function toggleTargetStatus(id: string, is_active: boolean): Promise<Target> {
  const response = await fetch(`${TARGETS_API}/${id}/toggle`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_active }),
  });
  return handleResponse<Target>(response);
}

export async function deleteTarget(id: string): Promise<void> {
  const response = await fetch(`${TARGETS_API}/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<any>(response);
}
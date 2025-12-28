import api from './axios';
import endpoints from './endpoint'

/* -------------- Types -------------- */

export interface Campaign {
    id: string;
    name: string;
    status: 'active' | 'paused' | 'completed';
    platforms: string[];
    budget: number;
    daily_budget: number;
    created_at: string;
    brand_id: string;
}

export interface CampaignInsight {
    totalRevenue: number;
    revenueTrend: number;
    newCustomers: number;
    customersTrend: number;
    activeAccounts: number;
    accountsTrend: number;
    growthRate: number;
    growthTrend: number;
}
export interface CampaignStreamMetrics {
    campaign_id: string;
    timestamp: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    ctr: number;
    cpc: number;
    conversion_rate: number;
}

/* -------------- API Calls -------------- */

export const getAllCampaigns = async (): Promise<Campaign[]> => {
    const res = await api.get(endpoints.campaigns.getAll);
    return res.data.campaigns;
};

export const getCampaignById = async (id: string) => {
    const res = await api.get(`/campaigns/${id}`);
    return res.data.campaign;
};

export const getAllCampaignInsights = async (): Promise<CampaignInsight[]> => {
    const res = await api.get(endpoints.campaigns.insights.getAll);
    return res.data;
};

export const getCampaignInsightsById = async (id: string): Promise<CampaignInsight> => {
    const res = await api.get(endpoints.campaigns.insights.getById(id));
    return res.data;
};

export const streamCampaignInsights = (id: string, onMessage: (data: CampaignStreamMetrics) => void) => {
    const eventSource = new EventSource(`https://mixo-fe-backend-task.vercel.app/campaigns/${id}/insights/stream`);

    eventSource.onmessage = event => {
        onMessage(JSON.parse(event.data));
    };

    eventSource.onerror = () => {
        eventSource.close();
    };

    return () => eventSource.close();
};

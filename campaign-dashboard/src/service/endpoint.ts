// src/Service/endpoints.ts

interface CampaignEndpoints {
  getAll: string;
  getById: (id: string) => string;
  insights: {
    getAll: string;
    getById: (id: string) => string;
    streamById: (id: string) => string;
  };
}

interface Endpoints {
  campaigns: CampaignEndpoints;
}

const endpoints: Endpoints = {
  campaigns: {
    getAll: '/campaigns',
    getById: (id: string) => `/campaigns/${id}`,

    insights: {
      getAll: '/campaigns/insights',
      getById: (id: string) => `/campaigns/${id}/insights`,
      streamById: (id: string) => `/campaigns/${id}/insights/stream`,
    },
  },
};

export default endpoints;

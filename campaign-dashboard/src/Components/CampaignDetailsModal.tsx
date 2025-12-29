'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '../Components/ui/dialog';
import { Badge } from './ui/badge';
import { getCampaignById, streamCampaignInsights } from '../service/campaignService';
type Props = {
    campaignId: string | null;
    open: boolean;
    onClose: () => void;
};

type CampaignStatus = 'active' | 'paused' | 'completed';

type Campaign = {
    id: string;
    name: string;
    status: CampaignStatus;
    budget: number;
    daily_budget: number;
    platforms: string[];
};

type Metrics = {
    impressions: number;
    clicks: number;
    ctr: number;
    spend: number;
};

type StreamStatus = 'connecting' | 'live' | 'stopped';

export function CampaignDetailsModal({ campaignId, open, onClose }: Props) {
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [streamStatus, setStreamStatus] = useState<StreamStatus>('connecting');

    useEffect(() => {
        if (!campaignId || !open) return;

        setCampaign(null);

        getCampaignById(campaignId).then(data => {
            setCampaign(data);
        });
    }, [campaignId, open]);

    useEffect(() => {
        if (!campaignId || !open) return;

        setStreamStatus('connecting');

        const stopStream = streamCampaignInsights(campaignId, (data: Metrics) => {
            setMetrics(data);
            setStreamStatus('live');
        });

        return () => {
            stopStream?.();
            setStreamStatus('stopped');
        };
    }, [campaignId, open]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-2/5 min-w-[40%] max-w-[40%] rounded-lg bg-white shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
                    <div>
                        <h2 className="text-lg font-semibold leading-tight">{campaign?.name ?? 'Loading campaign…'}</h2>

                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge
                                variant={
                                    campaign?.status === 'active'
                                        ? 'default'
                                        : campaign?.status === 'paused'
                                        ? 'secondary'
                                        : 'outline'
                                }
                            >
                                {campaign?.status ?? '—'}
                            </Badge>
                            <span>•</span>
                            <span>{campaign?.platforms?.join(', ') || '—'}</span>
                        </div>
                    </div>

                    <Badge variant={streamStatus === 'live' ? 'default' : 'outline'} className="gap-1">
                        <span
                            className={`h-2 w-2 rounded-full ${
                                streamStatus === 'live' ? 'bg-green-500 animate-pulse' : 'bg-muted'
                            }`}
                        />
                        {streamStatus.toUpperCase()}
                    </Badge>
                </div>

                <div className="grid grid-cols-4 gap-4 px-6 py-6 bg-muted/30">
                    <MetricCard label="Impressions" value={metrics?.impressions ?? '—'} />
                    <MetricCard label="Clicks" value={metrics?.clicks ?? '—'} />
                    <MetricCard label="CTR" value={metrics ? `${metrics.ctr}%` : '—'} />
                    <MetricCard label="Spend" value={metrics ? `$${metrics.spend}` : '—'} />
                </div>

                <div className="px-6 py-5 space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Campaign Details</h3>

                    <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
                        <Detail
                            label="Daily Budget"
                            value={campaign?.daily_budget != null ? `$${campaign.daily_budget}` : '—'}
                        />
                        <Detail label="Total Budget" value={campaign?.budget != null ? `$${campaign.budget}` : '—'} />
                        <Detail label="Platforms" value={campaign?.platforms?.join(', ') || '—'} />
                        <Detail label="Status" value={campaign?.status ?? '—'} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
function Detail({ label, value }: { label: string; value?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value ?? '—'}</span>
        </div>
    );
}

type MetricProps = {
    label: string;
    value: React.ReactNode;
};

function MetricCard({ label, value }: MetricProps) {
    return (
        <div className="rounded-xl border bg-background px-4 py-3 shadow-sm">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
        </div>
    );
}

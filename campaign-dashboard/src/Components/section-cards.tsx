'use client';

import React, { useEffect, useState } from 'react';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { Badge } from '../Components/ui/badge';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '../Components/ui/card';
import { Spinner } from '../Components/ui/spinner'; 

import { getAllCampaignInsights } from '../service/campaignService';


interface CampaignInsights {
    timestamp: string;
    total_campaigns: number;
    active_campaigns: number;
    paused_campaigns: number;
    completed_campaigns: number;
    total_impressions: number;
    total_clicks: number;
    total_conversions: number;
    total_spend: number;
    avg_ctr: number;
    avg_cpc: number;
    avg_conversion_rate: number;
}


export function SectionCards() {
    const [insights, setInsights] = useState<CampaignInsights | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchInsights() {
            try {
                const response: { insights: CampaignInsights } = await getAllCampaignInsights();
                setInsights(response.insights);
            } catch (error) {
                console.error('Error fetching campaign insights:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchInsights();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh] w-full">
                <Spinner className="h-16 w-16 text-primary" />
            </div>
        );
    }

    if (!insights) {
        return <div className="text-center text-muted-foreground">No insights available</div>;
    }

    const cards = [
        {
            title: 'Total Spend',
            value: `$${insights.total_spend.toLocaleString()}`,
            trend: insights.avg_cpc,
            description: 'Average CPC',
            footer: 'Total ad spend across campaigns'
        },
        {
            title: 'Impressions',
            value: insights.total_impressions.toLocaleString(),
            trend: insights.avg_ctr,
            description: 'Avg CTR',
            footer: 'Total ad impressions'
        },
        {
            title: 'Conversions',
            value: insights.total_conversions.toLocaleString(),
            trend: insights.avg_conversion_rate,
            description: 'Conversion Rate',
            footer: 'Successful conversions'
        },
        {
            title: 'Active Campaigns',
            value: insights.active_campaigns.toString(),
            trend: (insights.active_campaigns / insights.total_campaigns) * 100,
            description: 'Active Ratio',
            footer: 'Currently running campaigns'
        }
    ];


    return (
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {cards.map(card => {
                const isPositive = card.trend >= 0;

                return (
                    <Card key={card.title} className="relative overflow-hidden border-muted/40">
                        {/* Top accent line */}
                        <div
                            className={`absolute top-0 left-0 h-1 w-full ${
                                isPositive ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                        />

                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription className="text-sm">{card.title}</CardDescription>

                                <Badge variant={isPositive ? 'default' : 'destructive'} className="gap-1">
                                    {isPositive ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
                                    {card.trend.toFixed(2)}%
                                </Badge>
                            </div>

                            <CardTitle className="mt-2 text-3xl font-bold tracking-tight">{card.value}</CardTitle>
                        </CardHeader>

                        <CardFooter className="flex flex-col items-start gap-1 text-sm">
                            <span className="font-medium">{card.description}</span>
                            <span className="text-muted-foreground">{card.footer}</span>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}

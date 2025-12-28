'use client';

import * as React from 'react';
import { IconDashboard, IconUser } from '@tabler/icons-react';
import { NavMain } from '../Components/nav-main';
import { NavUser } from '../Components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '../Components/ui/sidebar';

const data = {
    user: {
        name: 'Campaign Monitor',
        email: 'admin@mixo.com',
        avatar: <IconUser size={28} />
    },
    navMain: [
        {
            title: 'Dashboard',
            url: '/dashboard',
            icon: IconDashboard
        },
        {
            title: 'Analytics',
            url: '/analytics',
            icon: IconDashboard
        }
    ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="offcanvas" className="w-64 bg-white border-r" {...props}>
            <SidebarHeader className="px-4 py-6 border-b">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <a
                                href="#"
                                className="flex items-center gap-2 text-lg font-semibold hover:text-blue-600 transition"
                            >
                                <IconUser size={24} />
                                <span>Mixo Campaigns</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="flex-1 px-2 py-4">
                <NavMain
                    items={data.navMain.map(item => {
                        const IconComponent = item.icon;
                        return {
                            ...item,
                            label: item.title,
                            icon: IconComponent,
                            href: item.url,
                            className: 'flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-100 transition'
                        };
                    })}
                />
            </SidebarContent>

            <SidebarFooter className="px-4 py-4 border-t">
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    );
}

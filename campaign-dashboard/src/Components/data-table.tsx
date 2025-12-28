import * as React from 'react';
import { getAllCampaigns } from '../service/campaignService';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender
} from '@tanstack/react-table';
import type { ColumnDef, SortingState, VisibilityState, ColumnFiltersState } from '@tanstack/react-table';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../Components/ui/table';
import { Tabs, TabsContent } from '../Components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../Components/ui/select';
import { Label } from '../Components/ui/label';
import { Button } from '../Components/ui/button';
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react';
import { CampaignDetailsModal } from './CampaignDetailsModal';

type Campaign = {
    id: string;
    name: string;
    brand_id: string;
    status: 'active' | 'paused' | 'completed';
    budget: number;
    daily_budget: number;
    platforms: string[];
    created_at: string;
};

export function DataTable() {
    const columns: ColumnDef<Campaign>[] = [
        {
            accessorKey: 'name',
            header: 'Campaign Name',
            cell: ({ row }) => (
                <button
                    className="text-pink-500 font-semibold hover:underline cursor-pointer"
                    onClick={() => {
                        setSelectedCampaignId(row.original.id);
                        setDrawerOpen(true);
                    }}
                >
                    {row.original.name}
                </button>
            )
        },
        {
            accessorKey: 'status',
            header: 'Status',
            enableColumnFilter: true,
            cell: ({ getValue }) => {
                const status = getValue<string>();

                let className = 'px-2 py-1 rounded-full text-white text-xs font-semibold';

                switch (status) {
                    case 'active':
                        className += ' bg-green-500';
                        break;
                    case 'paused':
                        className += ' bg-yellow-400';
                        break;
                    case 'completed':
                        className += ' bg-red-500';
                        break;
                    default:
                        className += ' bg-gray-400';
                }

                return <span className={className}>{status.toUpperCase()}</span>;
            }
        },

        {
            accessorKey: 'platforms',
            header: 'Platforms',
            enableColumnFilter: true,
            filterFn: (row, columnId, filterValue) => {
                if (!filterValue) return true;
                const platforms = row.getValue<string[]>(columnId);
                return platforms.includes(filterValue);
            },
            cell: ({ getValue }) => getValue<string[]>().join(', ')
        },
        {
            accessorKey: 'daily_budget',
            header: 'Daily Budget'
        },
        {
            accessorKey: 'budget',
            header: 'Total Budget'
        },
        {
            accessorKey: 'created_at',
            header: 'Created At',
            cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString()
        }
    ];
    const [data, setData] = React.useState<Campaign[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [selectedCampaignId, setSelectedCampaignId] = React.useState<string | null>(null);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 5
    });
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

    /* -------- Fetch API Data -------- */

    React.useEffect(() => {
        async function fetchCampaigns() {
            try {
                const campaigns = await getAllCampaigns();
                setData(campaigns);
            } catch (error) {
                console.error('Failed to fetch campaigns', error);
            } finally {
                setLoading(false);
            }
        }

        fetchCampaigns();
    }, []);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            pagination,
            columnFilters,
            columnVisibility
        },
        getRowId: row => row.id,
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel()
    });

    if (loading) {
        return <div className="p-6 text-center">Loading campaigns…</div>;
    }

    return (
        <Tabs defaultValue="outline" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 px-4 lg:px-6">
                <Label className="sr-only">Filters</Label>

                <Select
                    value={(table.getColumn('platforms')?.getFilterValue() as string) ?? 'all'}
                    onValueChange={value =>
                        table.getColumn('platforms')?.setFilterValue(value === 'all' ? undefined : value)
                    }
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter Platform" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Platforms</SelectItem>
                        <SelectItem value="meta">Meta</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="other">Others</SelectItem>
                    </SelectContent>
                </Select>

                {/* Status Filter */}
                <div className="flex gap-2">
                    {['all', 'active', 'paused', 'completed'].map(status => (
                        <Button
                            key={status}
                            size="sm"
                            variant={
                                table.getColumn('status')?.getFilterValue() === status ||
                                (status === 'all' && !table.getColumn('status')?.getFilterValue())
                                    ? 'default'
                                    : 'outline'
                            }
                            onClick={() =>
                                table.getColumn('status')?.setFilterValue(status === 'all' ? undefined : status)
                            }
                        >
                            {status.toUpperCase()}
                        </Button>
                    ))}
                </div>
            </div>

            <TabsContent value="outline" className="px-4 lg:px-6">
                <div className="rounded-xl border bg-background shadow-sm">
                    <div className="relative overflow-auto">
                        <Table>
                            <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur">
                                {table.getHeaderGroups().map(hg => (
                                    <TableRow key={hg.id}>
                                        {hg.headers.map(header => (
                                            <TableHead
                                                key={header.id}
                                                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>

                            <TableBody>
                                {table.getRowModel().rows.length ? (
                                    table.getRowModel().rows.map(row => (
                                        <TableRow
                                            key={row.id}
                                            className="
                  group
                  transition-colors
                  hover:bg-muted/40
                  data-[state=selected]:bg-muted
                "
                                        >
                                            {row.getVisibleCells().map(cell => (
                                                <TableCell key={cell.id} className="py-3 text-sm">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No campaigns found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-3">
                        <div className="text-xs text-muted-foreground">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <IconChevronsLeft className="size-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <IconChevronLeft className="size-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <IconChevronRight className="size-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <IconChevronsRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>
                <CampaignDetailsModal
                    campaignId={selectedCampaignId}
                    open={drawerOpen}
                    onClose={() => {
                        setDrawerOpen(false);
                        setSelectedCampaignId(null);
                    }}
                />
            </TabsContent>
        </Tabs>
    );
}

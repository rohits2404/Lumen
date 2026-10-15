"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { type DashboardNavItem } from "@/lib/config/dashboard";
import { cn } from "@/lib/utils";

const rowClass =
    "flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0";

const activeRowClass = "bg-card font-medium text-foreground shadow-sm";
const idleRowClass =
    "text-muted-foreground hover:bg-hover hover:text-foreground";

function RowTooltip({
    label,
    children,
}: {
    label: string;
    children: React.ReactElement;
}) {
    const { state, isMobile } = useSidebar();

    if (state !== "collapsed" || isMobile) return children;

    return (
        <Tooltip>
            <TooltipTrigger render={children} />
            <TooltipContent side="right" sideOffset={8}>
                {label}
            </TooltipContent>
        </Tooltip>
    );
}

function NavRow({
    item,
    active,
    badge,
}: {
    item: DashboardNavItem;
    active: boolean;
    badge?: number;
}) {
    const built = item.built ?? true;

    const body = (
        <>
            <item.icon className="size-4.5 shrink-0" />
            <span className="truncate group-data-[collapsible=icon]:hidden">
                {item.title}
            </span>
            {item.tag ? (
                <span className="ml-auto rounded-full border border-success/50 px-2 py-0.5 text-[11px] leading-none font-medium text-success group-data-[collapsible=icon]:hidden">
                    {item.tag}
                </span>
            ) : badge ? (
                <span className="ml-auto text-[13px] text-subtle-foreground tabular-nums group-data-[collapsible=icon]:hidden">
                    {badge}
                </span>
            ) : null}
        </>
    );

    if (!built) {
        return (
            <RowTooltip label={item.title}>
                <span
                    aria-disabled="true"
                    title="Coming soon"
                    className={cn(
                        rowClass,
                        "cursor-default text-muted-foreground",
                    )}
                >
                    {body}
                </span>
            </RowTooltip>
        );
    }

    return (
        <RowTooltip label={item.title}>
            <Link
                href={item.href}
                className={cn(rowClass, active ? activeRowClass : idleRowClass)}
            >
                {body}
            </Link>
        </RowTooltip>
    );
}

function NavRowWithChildren({
    item,
    pathname,
}: {
    item: DashboardNavItem;
    pathname: string;
}) {
    const { state, isMobile } = useSidebar();
    const childActive = item.items?.some((child) => pathname === child.href);
    const active = pathname === item.href || childActive;
    const [open, setOpen] = React.useState(Boolean(childActive));
    const built = item.built ?? true;
    const childBuilt = (child: { built?: boolean }) =>
        built && (child.built ?? true);

    if (state === "collapsed" && !isMobile) {
        return (
            <Tooltip>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <TooltipTrigger
                                render={
                                    <button
                                        type="button"
                                        className={cn(
                                            rowClass,
                                            "cursor-pointer",
                                            active
                                                ? activeRowClass
                                                : idleRowClass,
                                        )}
                                    />
                                }
                            />
                        }
                    >
                        <item.icon className="size-4.5 shrink-0" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="right"
                        align="start"
                        sideOffset={12}
                        className="w-48"
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                            {item.items?.map((child) =>
                                childBuilt(child) ? (
                                    <DropdownMenuItem
                                        key={child.href}
                                        render={<Link href={child.href} />}
                                        data-active={pathname === child.href}
                                        className="cursor-pointer data-[active=true]:bg-hover data-[active=true]:font-medium data-[active=true]:text-foreground"
                                    >
                                        {child.title}
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem
                                        key={child.href}
                                        disabled
                                        className="cursor-default"
                                    >
                                        {child.title}
                                    </DropdownMenuItem>
                                ),
                            )}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <TooltipContent side="right" sideOffset={8}>
                    {item.title}
                </TooltipContent>
            </Tooltip>
        );
    }

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger
                className={cn(
                    rowClass,
                    "cursor-pointer",
                    active ? activeRowClass : idleRowClass,
                )}
            >
                <item.icon className="size-4.5 shrink-0" />
                <span className="truncate group-data-[collapsible=icon]:hidden">
                    {item.title}
                </span>
                <ChevronDownIcon
                    className={cn(
                        "ml-auto size-4 shrink-0 text-subtle-foreground transition-transform group-data-[collapsible=icon]:hidden",
                        open && "rotate-180",
                    )}
                />
            </CollapsibleTrigger>
            <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                <SidebarMenuSub className="mt-px mr-0 gap-px border-border pr-0">
                    {item.items?.map((child) => (
                        <SidebarMenuSubItem key={child.href}>
                            {childBuilt(child) ? (
                                <SidebarMenuSubButton
                                    isActive={pathname === child.href}
                                    render={<Link href={child.href} />}
                                    className="h-8 text-sm text-muted-foreground data-[active=true]:bg-card data-[active=true]:text-foreground data-[active=true]:shadow-sm"
                                >
                                    {child.title}
                                </SidebarMenuSubButton>
                            ) : (
                                <SidebarMenuSubButton
                                    aria-disabled="true"
                                    title="Coming soon"
                                    render={<span />}
                                    className="h-8 cursor-default text-sm text-muted-foreground hover:bg-transparent"
                                >
                                    {child.title}
                                </SidebarMenuSubButton>
                            )}
                        </SidebarMenuSubItem>
                    ))}
                </SidebarMenuSub>
            </CollapsibleContent>
        </Collapsible>
    );
}

export {
    rowClass,
    activeRowClass,
    idleRowClass,
    RowTooltip,
    NavRow,
    NavRowWithChildren,
};

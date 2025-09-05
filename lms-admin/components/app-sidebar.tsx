"use client";

import * as React from "react";
import { IconBook, IconFolder, IconUsers, IconClipboardList } from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";

const data = {
  user: {
    name: "Әкімші",
    email: "admin@example.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Курстар",
      url: "/courses",
      icon: IconBook,
    },
    {
      title: "Пайдаланушылар",
      url: "/users",
      icon: IconUsers,
    },
    {
      title: "Бастапқы тест",
      url: "/placement-tests",
      icon: IconClipboardList,
    },
    {
      title: "Файлдар",
      url: "/files",
      icon: IconFolder,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <Image src="/logo.png" alt="Qazaqsha" width={32} height={32} />
                <span className="text-base font-semibold">Qazaqsha</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  );
}

"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, signOut, User as FirebaseAuthUser } from "firebase/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  Briefcase,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  PanelLeft,
  Home,
  Moon,
  Sun,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

type UserProfile = {
    roles?: string[];
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { toggleSidebar } = useSidebar();
    const auth = getAuth(db.app);
    const [user, setUser] = useState<FirebaseAuthUser | null>(auth.currentUser);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const { setTheme, theme } = useTheme();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            setUser(user);
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                setUserProfile(docSnap.data() as UserProfile);
            }
          } else {
            router.push("/login");
          }
          setLoading(false);
        });
    
        // Cleanup subscription on unmount
        return () => unsubscribe();
      }, [auth, router]);

    const handleLogout = () => {
        signOut(auth).then(() => {
            router.push("/login");
        });
    };

    const getInitials = (email: string | null | undefined) => {
        if (!email) return "U";
        const parts = email.split('@')[0].split('.');
        if (parts.length > 1 && parts[0] && parts[1]) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return email.substring(0, 2).toUpperCase();
    }
    
    const isAdmin = userProfile?.roles?.includes("admin");

    const menuItems = [
        { href: "/dashboard", icon: <Home />, label: "Home" },
        ...(isAdmin ? [{ href: "/dashboard/users", icon: <Users />, label: "Users" }] : []),
    ];
    
    if (loading) {
        return (
          <div className="flex items-center justify-center h-screen">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 ml-4">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        );
      }

    return (
        <div className="flex flex-1">
            <Sidebar variant="inset">
            <SidebarHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="shrink-0">
                            <Briefcase className="size-5" />
                        </Button>
                        <span className="font-headline text-lg font-semibold group-data-[collapsible=icon]:opacity-0">Momentum BI</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <Link href={item.href}>
                        <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label}>
                            {item.icon}
                            <span>{item.label}</span>
                        </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                    ))}
                     <SidebarMenuItem>
                        <SidebarMenuButton onClick={toggleSidebar} tooltip="Collapse">
                            <PanelLeft />
                            <span>Collapse</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            </Sidebar>
            <SidebarInset className="flex-1">
            <header className="flex h-14 items-center justify-end border-b bg-card px-4 lg:px-6">
                <div className="w-full flex-1">
                {/* Can add breadcrumbs or search here if needed */}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="mr-2"
                    >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{user?.email || "Jane Doe"}</span>
                    <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <DropdownMenuItem asChild>
                                <a href={`mailto:harpinder.singh@rvsolutions.in?subject=Request from ${user?.email} for addition of new report`}>
                                Request
                                </a>
                            </DropdownMenuItem>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>You can Request additions of New Reports</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                {children}
            </main>
            </SidebarInset>
        </div>
    );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

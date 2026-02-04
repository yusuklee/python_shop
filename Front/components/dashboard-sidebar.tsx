"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, Package, FolderTree, ShoppingCart, LayoutDashboard, LogOut, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserInfo } from "@/lib/api";

const adminNavigation = [
  { name: "대시보드", href: "/", icon: LayoutDashboard },
  { name: "회원 관리", href: "/members", icon: Users },
  { name: "상품 관리", href: "/items", icon: Package },
  { name: "카테고리 관리", href: "/categories", icon: FolderTree },
];

const memberNavigation = [
  { name: "주문하기", href: "/orders", icon: ShoppingCart },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userType, setUserType] = useState<"admin" | "member" | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const storedUserType = localStorage.getItem("user_type") as "admin" | "member" | null;
    const storedUserInfo = localStorage.getItem("user_info");
    setUserType(storedUserType);
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  const navigation = userType === "admin" ? adminNavigation : memberNavigation;

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("user_type");
    localStorage.removeItem("user_info");
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 gradient-sidebar flex flex-col shadow-xl">
      <Link
        href={userType === "admin" ? "/" : "/orders"}
        className="flex h-16 items-center gap-3 border-b border-white/10 px-6 hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
          <Store className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white">Shop Admin</h1>
      </Link>
      <nav className="flex flex-col gap-1 p-4 flex-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white text-sidebar-primary-foreground shadow-md"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        {userInfo && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-white/10">
            <p className="text-sm font-medium text-white">{userInfo.name}</p>
            <p className="text-xs text-white/60">{userType === "admin" ? "관리자" : "회원"}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-white/80 hover:text-white hover:bg-white/10"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          로그아웃
        </Button>
      </div>
    </aside>
  );
}

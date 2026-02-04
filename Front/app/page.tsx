"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, FolderTree, TrendingUp, Activity } from "lucide-react";
import Link from "next/link";

const stats = [
  {
    name: "회원 관리",
    description: "회원 조회, 등록, 수정, 삭제",
    icon: Users,
    href: "/members",
    gradient: "from-blue-500 to-blue-600",
    lightBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    name: "상품 관리",
    description: "도서, 앨범, 영화 상품 관리",
    icon: Package,
    href: "/items",
    gradient: "from-emerald-500 to-emerald-600",
    lightBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    name: "카테고리 관리",
    description: "카테고리 생성 및 상품 연결",
    icon: FolderTree,
    href: "/categories",
    gradient: "from-orange-500 to-orange-600",
    lightBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const userType = localStorage.getItem("user_type");
    if (userType === "member") {
      router.replace("/orders");
    }
  }, [router]);

  return (
    <DashboardLayout>
      <PageHeader
        title="대시보드"
        description="쇼핑몰 관리 시스템에 오신 것을 환영합니다"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="cursor-pointer card-hover border-0 shadow-md overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold text-foreground">
                  {stat.name}
                </CardTitle>
                <div className={`rounded-xl p-2.5 ${stat.lightBg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>빠른 시작 가이드</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 p-4 border border-primary/10">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">1</span>
                회원 등록
              </h3>
              <p className="mt-2 text-sm text-muted-foreground ml-8">
                회원 관리 메뉴에서 새로운 회원을 등록하세요.
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-emerald-500/5 to-emerald-500/10 p-4 border border-emerald-500/10">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">2</span>
                상품 추가
              </h3>
              <p className="mt-2 text-sm text-muted-foreground ml-8">
                도서, 앨범, 영화 등 다양한 상품을 추가하세요.
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-orange-500/5 to-orange-500/10 p-4 border border-orange-500/10">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs text-white">3</span>
                카테고리 설정
              </h3>
              <p className="mt-2 text-sm text-muted-foreground ml-8">
                상품을 카테고리로 분류하세요.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>API 엔드포인트</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  회원 API
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">GET</code>
                    /member/show/all
                  </li>
                  <li className="flex items-center gap-2">
                    <code className="rounded bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 text-xs">POST</code>
                    /member/signup
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-500" />
                  상품 API
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">GET</code>
                    /item/show/all
                  </li>
                  <li className="flex items-center gap-2">
                    <code className="rounded bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 text-xs">POST</code>
                    /item/create/book
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

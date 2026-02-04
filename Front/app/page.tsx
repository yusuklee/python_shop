"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, FolderTree, ShoppingCart } from "lucide-react";
import Link from "next/link";

const stats = [
  {
    name: "회원 관리",
    description: "회원 조회, 등록, 수정, 삭제",
    icon: Users,
    href: "/members",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    name: "상품 관리",
    description: "도서, 앨범, 영화 상품 관리",
    icon: Package,
    href: "/items",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    name: "카테고리 관리",
    description: "카테고리 생성 및 상품 연결",
    icon: FolderTree,
    href: "/categories",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    name: "주문 관리",
    description: "주문 생성 및 관리",
    icon: ShoppingCart,
    href: "/orders",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="대시보드"
        description="쇼핑몰 관리 시스템에 오신 것을 환영합니다"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="cursor-pointer transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>시스템 안내</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-semibold text-foreground">API 엔드포인트</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                이 관리 시스템은 FastAPI 백엔드와 연동됩니다. 환경변수 NEXT_PUBLIC_API_URL을 설정하여 API 서버 주소를 지정할 수 있습니다.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <h4 className="font-medium text-foreground">회원 API</h4>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>GET /member/show/all - 전체 회원 조회</li>
                  <li>POST /member/create - 회원 생성</li>
                  <li>PATCH /member/update/id - 회원 수정</li>
                  <li>DELETE /member/delete/id - 회원 삭제</li>
                </ul>
              </div>
              <div className="rounded-lg border border-border p-4">
                <h4 className="font-medium text-foreground">상품 API</h4>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>GET /item/show/all - 전체 상품 조회</li>
                  <li>POST /item/create/book,album,movie - 상품 생성</li>
                  <li>PATCH /item/update/id - 상품 수정</li>
                  <li>DELETE /item/delete/id - 상품 삭제</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

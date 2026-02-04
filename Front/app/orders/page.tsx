"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { itemApi, orderApi, type Item, type OrderItem, type OrderCreate, type UserInfo } from "@/lib/api";
import { Plus, Trash2, ShoppingCart, User } from "lucide-react";

const itemFetcher = () => itemApi.getAll();

export default function OrdersPage() {
  const { data: items } = useSWR("items-for-order", itemFetcher);

  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [zip, setZip] = useState("");
  const [addr1, setAddr1] = useState("");
  const [addr2, setAddr2] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [itemCount, setItemCount] = useState<number>(1);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 로그인한 회원 정보 로드
  useEffect(() => {
    const storedUserInfo = localStorage.getItem("user_info");
    if (storedUserInfo) {
      const userInfo: UserInfo = JSON.parse(storedUserInfo);
      setCurrentUser(userInfo);
      // 배송지 정보 자동 설정
      setZip(userInfo.zip || "");
      setAddr1(userInfo.addr1 || "");
      setAddr2(userInfo.addr2 || "");
    }
  }, []);

  const showMessage = (msg: string, type: "success" | "error") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleAddItem = () => {
    if (!selectedItemId || itemCount <= 0) return;

    const existingIndex = orderItems.findIndex(
      (item) => item.item_id === Number(selectedItemId)
    );

    if (existingIndex >= 0) {
      const updated = [...orderItems];
      updated[existingIndex].count += itemCount;
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        { item_id: Number(selectedItemId), count: itemCount },
      ]);
    }

    setSelectedItemId("");
    setItemCount(1);
  };

  const handleRemoveItem = (itemId: number) => {
    setOrderItems(orderItems.filter((item) => item.item_id !== itemId));
  };

  const getItemName = (itemId: number) => {
    const item = items?.find((i) => i.id === itemId);
    return item?.name || `상품 #${itemId}`;
  };

  const getItemPrice = (itemId: number) => {
    const item = items?.find((i) => i.id === itemId);
    return item?.price || 0;
  };

  const getTotalPrice = () => {
    return orderItems.reduce((total, orderItem) => {
      return total + getItemPrice(orderItem.item_id) * orderItem.count;
    }, 0);
  };

  const handleCreateOrder = async () => {
    if (!currentUser || orderItems.length === 0) {
      showMessage("상품을 선택해주세요.", "error");
      return;
    }

    if (!zip || !addr1 || !addr2) {
      showMessage("배송지 정보를 모두 입력해주세요.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const data: OrderCreate = {
        zip,
        addr1,
        addr2,
        items: orderItems,
      };
      await orderApi.create(currentUser.id, data);
      showMessage("주문이 성공적으로 생성되었습니다.", "success");
      // Reset form - 배송지는 유지
      setOrderItems([]);
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "주문 생성에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="주문 관리" description="새로운 주문을 생성합니다" />

      {message && (
        <div
          className={`mb-4 rounded-lg p-4 ${
            messageType === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 주문 정보 입력 */}
        <div className="space-y-6">
          {/* 주문자 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                주문자 정보
              </CardTitle>
              <CardDescription>로그인한 회원 정보로 주문합니다</CardDescription>
            </CardHeader>
            <CardContent>
              {currentUser ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">이름</span>
                    <span className="font-medium">{currentUser.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">이메일</span>
                    <span className="font-medium">{currentUser.email}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">로그인 정보를 불러오는 중...</p>
              )}
            </CardContent>
          </Card>

          {/* 배송 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>배송 정보</CardTitle>
              <CardDescription>배송지 정보를 입력하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="order-zip">우편번호 *</Label>
                <Input
                  id="order-zip"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="우편번호"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order-addr1">주소 *</Label>
                <Input
                  id="order-addr1"
                  value={addr1}
                  onChange={(e) => setAddr1(e.target.value)}
                  placeholder="기본 주소"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order-addr2">상세 주소 *</Label>
                <Input
                  id="order-addr2"
                  value={addr2}
                  onChange={(e) => setAddr2(e.target.value)}
                  placeholder="상세 주소"
                />
              </div>
            </CardContent>
          </Card>

          {/* 상품 추가 */}
          <Card>
            <CardHeader>
              <CardTitle>상품 추가</CardTitle>
              <CardDescription>주문할 상품을 선택하고 수량을 입력하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>상품</Label>
                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                  <SelectTrigger>
                    <SelectValue placeholder="상품을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {items?.map((item, index) => (
                      <SelectItem key={item.id ?? `item-${index}`} value={String(item.id)}>
                        {item.name} - {item.price.toLocaleString()}원 (재고: {item.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-count">수량</Label>
                <Input
                  id="item-count"
                  type="number"
                  min="1"
                  value={itemCount}
                  onChange={(e) => setItemCount(Number(e.target.value))}
                />
              </div>
              <Button onClick={handleAddItem} className="w-full" disabled={!selectedItemId}>
                <Plus className="mr-2 h-4 w-4" />
                상품 추가
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 주문 요약 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                주문 목록
              </CardTitle>
              <CardDescription>
                {orderItems.length > 0
                  ? `${orderItems.length}개 상품이 담겨있습니다`
                  : "주문할 상품을 추가하세요"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orderItems.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    주문할 상품이 없습니다
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>상품명</TableHead>
                      <TableHead>수량</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((orderItem, index) => (
                      <TableRow key={`order-item-${orderItem.item_id}-${index}`}>
                        <TableCell className="font-medium">
                          {getItemName(orderItem.item_id)}
                        </TableCell>
                        <TableCell>{orderItem.count}</TableCell>
                        <TableCell>
                          {(getItemPrice(orderItem.item_id) * orderItem.count).toLocaleString()}원
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(orderItem.item_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* 결제 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>결제 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-muted-foreground">상품 수</span>
                <span className="font-medium">{orderItems.length}개</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-muted-foreground">총 수량</span>
                <span className="font-medium">
                  {orderItems.reduce((sum, item) => sum + item.count, 0)}개
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">총 결제 금액</span>
                <span className="text-2xl font-bold text-primary">
                  {getTotalPrice().toLocaleString()}원
                </span>
              </div>
              <Button
                className="mt-4 w-full"
                size="lg"
                onClick={handleCreateOrder}
                disabled={isSubmitting || !currentUser || orderItems.length === 0}
              >
                {isSubmitting ? "주문 처리 중..." : "주문하기"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

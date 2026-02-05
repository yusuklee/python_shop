"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { memberApi, orderApi, type UserInfo, type Order } from "@/lib/api";
import { User, ShoppingBag, Save, X } from "lucide-react";
import { format } from "date-fns";

export default function MyPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    zip: "",
    addr1: "",
    addr2: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const userType = localStorage.getItem("user_type");
    if (userType === "admin") {
      router.replace("/");
      return;
    }

    const storedUserInfo = localStorage.getItem("user_info");
    if (storedUserInfo) {
      const userInfo: UserInfo = JSON.parse(storedUserInfo);
      setCurrentUser(userInfo);
      setFormData({
        name: userInfo.name,
        email: userInfo.email || "",
        password: "",
        zip: userInfo.zip || "",
        addr1: userInfo.addr1 || "",
        addr2: userInfo.addr2 || "",
      });
    }
  }, [router]);

  const showMessage = (msg: string, type: "success" | "error") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleUpdate = async () => {
    if (!currentUser?.id) return;

    if (!formData.name || !formData.email) {
      showMessage("이름과 이메일은 필수입니다.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData: Record<string, string> = {
        name: formData.name,
        email: formData.email,
        zip: formData.zip,
        addr1: formData.addr1,
        addr2: formData.addr2,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }

      await memberApi.update(currentUser.id, updateData);

      // Update local storage
      const updatedUserInfo = {
        ...currentUser,
        name: formData.name,
        email: formData.email,
        zip: formData.zip,
        addr1: formData.addr1,
        addr2: formData.addr2,
      };
      localStorage.setItem("user_info", JSON.stringify(updatedUserInfo));
      setCurrentUser(updatedUserInfo);

      showMessage("정보가 성공적으로 수정되었습니다.", "success");
      setIsEditing(false);
      setFormData({ ...formData, password: "" });
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "정보 수정에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openOrdersDialog = async () => {
    if (!currentUser?.id) return;

    setIsOrdersOpen(true);
    setOrdersLoading(true);
    setOrdersError(null);

    try {
      const memberOrders = await orderApi.getByMemberId(currentUser.id);
      setOrders(memberOrders);
    } catch (e) {
      setOrdersError(e instanceof Error ? e.message : "주문 내역을 불러오는데 실패했습니다.");
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleCancelOrder = (orderId: number) => {
    setOrderToCancel(orderId);
    setCancelDialogOpen(true);
  };

  const confirmCancelOrder = async () => {
    if (orderToCancel === null) return;

    try {
      await orderApi.cancel(orderToCancel);
      setOrders(orders.filter((order) => order.id !== orderToCancel));
      showMessage("주문이 취소되었습니다.", "success");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "주문 취소에 실패했습니다.", "error");
    } finally {
      setCancelDialogOpen(false);
      setOrderToCancel(null);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="마이페이지" description="내 정보를 확인하고 수정합니다" />

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
        {/* 내 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              내 정보
            </CardTitle>
            <CardDescription>회원 정보를 확인하고 수정할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">이름 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="이름"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">이메일 *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="이메일"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">새 비밀번호 (변경시에만 입력)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="새 비밀번호"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="zip">우편번호</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    placeholder="우편번호"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="addr1">주소</Label>
                  <Input
                    id="addr1"
                    value={formData.addr1}
                    onChange={(e) => setFormData({ ...formData, addr1: e.target.value })}
                    placeholder="기본 주소"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="addr2">상세 주소</Label>
                  <Input
                    id="addr2"
                    value={formData.addr2}
                    onChange={(e) => setFormData({ ...formData, addr2: e.target.value })}
                    placeholder="상세 주소"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleUpdate} disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? "저장 중..." : "저장"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      if (currentUser) {
                        setFormData({
                          name: currentUser.name,
                          email: currentUser.email || "",
                          password: "",
                          zip: currentUser.zip || "",
                          addr1: currentUser.addr1 || "",
                          addr2: currentUser.addr2 || "",
                        });
                      }
                    }}
                  >
                    취소
                  </Button>
                </div>
              </>
            ) : (
              <>
                {currentUser ? (
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">이름</span>
                      <span className="font-medium">{currentUser.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">이메일</span>
                      <span className="font-medium">{currentUser.email || "-"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">우편번호</span>
                      <span className="font-medium">{currentUser.zip || "-"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">주소</span>
                      <span className="font-medium">{currentUser.addr1 || "-"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">상세 주소</span>
                      <span className="font-medium">{currentUser.addr2 || "-"}</span>
                    </div>
                    <Button className="w-full mt-4" onClick={() => setIsEditing(true)}>
                      정보 수정
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">정보를 불러오는 중...</p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* 주문 내역 버튼 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              주문 내역
            </CardTitle>
            <CardDescription>나의 주문 내역을 확인할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" onClick={openOrdersDialog}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              주문 내역 보기
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 주문 내역 다이얼로그 */}
      <Dialog open={isOrdersOpen} onOpenChange={setIsOrdersOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>내 주문 내역</DialogTitle>
            <DialogDescription>주문한 상품 내역을 확인하세요</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {ordersLoading && <p className="text-muted-foreground">주문 내역 로딩 중...</p>}
            {ordersError && <p className="text-destructive">{ordersError}</p>}
            {!ordersLoading && !ordersError && orders.length === 0 && (
              <div className="text-center py-8">
                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">주문 내역이 없습니다.</p>
              </div>
            )}
            {orders.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>주문 ID</TableHead>
                    <TableHead>주문일</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>총 가격</TableHead>
                    <TableHead>상품</TableHead>
                    <TableHead className="w-[80px]">취소</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{format(new Date(order.order_date), "yyyy-MM-dd HH:mm")}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>{order.total_price.toLocaleString()}원</TableCell>
                      <TableCell>
                        {order.order_items.map((item, idx) => (
                          <div key={idx}>
                            {item.item_name} ({item.count}개)
                          </div>
                        ))}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrdersOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 주문 취소 확인 다이얼로그 */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>주문 취소</DialogTitle>
            <DialogDescription>
              주문을 취소하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              아니오
            </Button>
            <Button variant="destructive" onClick={confirmCancelOrder}>
              예, 취소합니다
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

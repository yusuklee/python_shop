"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { memberApi, orderApi, type Member, type MemberCreate, type Order } from "@/lib/api";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";

const fetcher = () => memberApi.getAll();

export default function MembersPage() {
  const router = useRouter();
  const { data: members, error, isLoading, mutate } = useSWR("members", fetcher);

  useEffect(() => {
    const userType = localStorage.getItem("user_type");
    if (userType === "member") {
      router.replace("/orders");
    }
  }, [router]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false); // New state for detail dialog
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState<Member | null>(null); // New state for member detail
  const [memberOrders, setMemberOrders] = useState<Order[] | null>(null); // New state for member orders
  const [memberOrdersLoading, setMemberOrdersLoading] = useState(false); // New state for loading orders
  const [memberOrdersError, setMemberOrdersError] = useState<string | null>(null); // New state for orders error
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState<MemberCreate>({
    name: "",
    email: "",
    password: "",
    zip: "",
    addr1: "",
    addr2: "",
  });

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", zip: "", addr1: "", addr2: "" });
    setErrorMsg("");
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.zip || !formData.addr1 || !formData.addr2) {
      setErrorMsg("모든 필드를 입력해주세요.");
      return;
    }
    if (formData.name.length < 2 || formData.name.length > 20) {
      setErrorMsg("이름은 2-20자 사이여야 합니다.");
      return;
    }
    if (formData.email.length < 5 || formData.email.length > 30) {
      setErrorMsg("이메일은 5-30자 사이여야 합니다.");
      return;
    }
    if (formData.password.length < 5 || formData.password.length > 20) {
      setErrorMsg("비밀번호는 5-20자 사이여야 합니다.");
      return;
    }

    try {
      await memberApi.create(formData);
      mutate();
      setIsCreateOpen(false);
      resetForm();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "회원 생성에 실패했습니다.");
    }
  };

  const handleUpdate = async () => {
    if (!selectedMember?.id) return;
    try {
      const updateData: Partial<MemberCreate> = {
        name: formData.name,
        email: formData.email,
        zip: formData.zip,
        addr1: formData.addr1,
        addr2: formData.addr2,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      await memberApi.update(selectedMember.id, updateData);
      mutate();
      setIsEditOpen(false);
      setSelectedMember(null);
      resetForm();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "회원 수정에 실패했습니다.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await memberApi.delete(id);
      mutate();
    } catch (e) {
      console.error("Failed to delete member:", e);
    }
  };

  const openEditDialog = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      email: member.email || "",
      password: "",
      zip: member.zip || "",
      addr1: member.addr1 || "",
      addr2: member.addr2 || "",
    });
    setErrorMsg("");
    setIsEditOpen(true);
  };

  // New function to open member detail dialog and fetch orders
  const openMemberDetailDialog = async (member: Member) => {
    setSelectedMemberForDetail(member);
    setIsDetailOpen(true);
    setMemberOrdersLoading(true);
    setMemberOrdersError(null);
    try {
      const orders = await orderApi.getByMemberId(member.id);
      setMemberOrders(orders);
    } catch (e) {
      setMemberOrdersError(e instanceof Error ? e.message : "주문 내역을 불러오는데 실패했습니다.");
      setMemberOrders(null);
    } finally {
      setMemberOrdersLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="회원 관리" description="회원 정보를 조회하고 관리합니다">
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              회원 등록
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 회원 등록</DialogTitle>
              <DialogDescription>새로운 회원 정보를 입력하세요.</DialogDescription>
            </DialogHeader>
            {errorMsg && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                {errorMsg}
              </div>
            )}
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">이름 (2-20자) *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="회원 이름"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">이메일 (5-30자) *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="이메일"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">비밀번호 (5-20자) *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="비밀번호"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zip">우편번호 *</Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  placeholder="우편번호"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="addr1">주소 *</Label>
                <Input
                  id="addr1"
                  value={formData.addr1}
                  onChange={(e) => setFormData({ ...formData, addr1: e.target.value })}
                  placeholder="기본 주소"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="addr2">상세 주소 *</Label>
                <Input
                  id="addr2"
                  value={formData.addr2}
                  onChange={(e) => setFormData({ ...formData, addr2: e.target.value })}
                  placeholder="상세 주소"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                취소
              </Button>
              <Button onClick={handleCreate}>등록</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>회원 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-muted-foreground">로딩 중...</p>}
          {error && <p className="text-destructive">데이터를 불러오는데 실패했습니다. 백엔드 서버를 확인하세요.</p>}
          {members && members.length === 0 && (
            <p className="text-muted-foreground">등록된 회원이 없습니다.</p>
          )}
          {members && members.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>우편번호</TableHead>
                  <TableHead>주소</TableHead>
                  <TableHead>상세주소</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member, index) => (
                  <TableRow key={member.id ?? `member-${index}`}>
                    <TableCell>{member.id}</TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email || "-"}</TableCell>
                    <TableCell>{member.zip || "-"}</TableCell>
                    <TableCell>{member.addr1 || "-"}</TableCell>
                    <TableCell>{member.addr2 || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openMemberDetailDialog(member)} // New: View Details button
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(member)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>회원 삭제</AlertDialogTitle>
                              <AlertDialogDescription>
                                정말로 &quot;{member.name}&quot; 회원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction onClick={() => member.id && handleDelete(member.id)}>
                                삭제
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>회원 정보 수정</DialogTitle>
            <DialogDescription>회원 정보를 수정하세요. 비밀번호는 변경 시에만 입력하세요.</DialogDescription>
          </DialogHeader>
          {errorMsg && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {errorMsg}
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">이름</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="회원 이름"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">이메일</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="이메일"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">비밀번호 (변경 시 입력)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="새 비밀번호"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-zip">우편번호</Label>
              <Input
                id="edit-zip"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                placeholder="우편번호"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-addr1">주소</Label>
              <Input
                id="edit-addr1"
                value={formData.addr1}
                onChange={(e) => setFormData({ ...formData, addr1: e.target.value })}
                placeholder="기본 주소"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-addr2">상세 주소</Label>
              <Input
                id="edit-addr2"
                value={formData.addr2}
                onChange={(e) => setFormData({ ...formData, addr2: e.target.value })}
                placeholder="상세 주소"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              취소
            </Button>
            <Button onClick={handleUpdate}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>회원 상세 정보</DialogTitle>
            <DialogDescription>선택된 회원의 상세 정보와 주문 내역입니다.</DialogDescription>
          </DialogHeader>
          {selectedMemberForDetail && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">회원 ID:</span>
                <span>{selectedMemberForDetail.id}</span>
                <span className="font-medium">이름:</span>
                <span>{selectedMemberForDetail.name}</span>
                <span className="font-medium">이메일:</span>
                <span>{selectedMemberForDetail.email}</span>
                <span className="font-medium">우편번호:</span>
                <span>{selectedMemberForDetail.zip}</span>
                <span className="font-medium">주소:</span>
                <span>{selectedMemberForDetail.addr1}</span>
                <span className="font-medium">상세 주소:</span>
                <span>{selectedMemberForDetail.addr2}</span>
              </div>

              <h3 className="text-lg font-semibold mt-4">주문 내역</h3>
              {memberOrdersLoading && <p className="text-muted-foreground">주문 내역 로딩 중...</p>}
              {memberOrdersError && <p className="text-destructive">{memberOrdersError}</p>}
              {memberOrders && memberOrders.length === 0 && (
                <p className="text-muted-foreground">주문 내역이 없습니다.</p>
              )}
              {memberOrders && memberOrders.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>주문 ID</TableHead>
                      <TableHead>주문일</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>총 가격</TableHead>
                      <TableHead>상품</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberOrders.map((order) => (
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

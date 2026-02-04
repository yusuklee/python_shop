"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryApi, itemApi, type Item } from "@/lib/api";
import { Plus, Link as LinkIcon, Trash2, FolderTree, Search } from "lucide-react";

const itemFetcher = () => itemApi.getAll();

export default function CategoriesPage() {
  const router = useRouter();
  const { data: items } = useSWR("items-for-category", itemFetcher);

  useEffect(() => {
    const userType = localStorage.getItem("user_type");
    if (userType === "member") {
      router.replace("/orders");
    }
  }, [router]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [categoryName, setCategoryName] = useState("");
  const [categoryDes, setCategoryDes] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [connectCategoryName, setConnectCategoryName] = useState("");
  const [parentCategoryName, setParentCategoryName] = useState("");
  const [childCategoryName, setChildCategoryName] = useState("");
  const [targetCategoryName, setTargetCategoryName] = useState("");
  const [deleteCategoryName, setDeleteCategoryName] = useState("");

  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState<unknown>(null);
  const [searchError, setSearchError] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const showMessage = (msg: string, type: "success" | "error") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleCreateCategory = async () => {
    if (!categoryName || !categoryDes) {
      showMessage("카테고리명과 설명을 입력해주세요.", "error");
      return;
    }
    try {
      await categoryApi.create(categoryName, categoryDes);
      showMessage("카테고리가 생성되었습니다.", "success");
      setIsCreateOpen(false);
      setCategoryName("");
      setCategoryDes("");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "카테고리 생성에 실패했습니다.", "error");
    }
  };

  const handleConnectItem = async () => {
    if (!selectedItemId || !connectCategoryName) {
      showMessage("상품과 카테고리명을 모두 선택해주세요.", "error");
      return;
    }
    try {
      await categoryApi.connectItem(Number(selectedItemId), connectCategoryName);
      showMessage("상품이 카테고리에 연결되었습니다.", "success");
      setSelectedItemId("");
      setConnectCategoryName("");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "상품 연결에 실패했습니다.", "error");
    }
  };

  const handleAddChild = async () => {
    if (!targetCategoryName || !childCategoryName) {
      showMessage("대상 카테고리명과 하위 카테고리명을 입력해주세요.", "error");
      return;
    }
    try {
      await categoryApi.addChild(targetCategoryName, childCategoryName);
      showMessage("하위 카테고리가 추가되었습니다.", "success");
      setTargetCategoryName("");
      setChildCategoryName("");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "하위 카테고리 추가에 실패했습니다.", "error");
    }
  };

  const handleAddParent = async () => {
    if (!targetCategoryName || !parentCategoryName) {
      showMessage("대상 카테고리명과 상위 카테고리명을 입력해주세요.", "error");
      return;
    }
    try {
      await categoryApi.addParent(targetCategoryName, parentCategoryName);
      showMessage("상위 카테고리가 추가되었습니다.", "success");
      setTargetCategoryName("");
      setParentCategoryName("");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "상위 카테고리 추가에 실패했습니다.", "error");
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryName) {
      showMessage("삭제할 카테고리명을 입력해주세요.", "error");
      return;
    }
    try {
      await categoryApi.delete(deleteCategoryName);
      showMessage("카테고리가 삭제되었습니다.", "success");
      setDeleteCategoryName("");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "카테고리 삭제에 실패했습니다.", "error");
    }
  };

  const handleSearch = async () => {
    if (!searchId) {
      setSearchError("카테고리 ID를 입력해주세요.");
      return;
    }
    try {
      setSearchError("");
      const result = await categoryApi.getById(Number(searchId));
      setSearchResult(result);
    } catch (e) {
      setSearchError("카테고리를 찾을 수 없습니다.");
      setSearchResult(null);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="카테고리 관리" description="카테고리를 생성하고 상품을 연결합니다">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              카테고리 생성
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 카테고리 생성</DialogTitle>
              <DialogDescription>새로운 카테고리 정보를 입력하세요.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="ca-name">카테고리명 *</Label>
                <Input
                  id="ca-name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="카테고리명"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ca-des">설명 *</Label>
                <Textarea
                  id="ca-des"
                  value={categoryDes}
                  onChange={(e) => setCategoryDes(e.target.value)}
                  placeholder="카테고리 설명"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                취소
              </Button>
              <Button onClick={handleCreateCategory}>생성</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

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

      <div className="grid gap-6 md:grid-cols-2">
        {/* 카테고리 조회 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              카테고리 조회
            </CardTitle>
            <CardDescription>ID로 카테고리 정보를 조회합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="카테고리 ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                type="number"
              />
              <Button onClick={handleSearch}>조회</Button>
            </div>
            {searchError && <p className="text-sm text-destructive">{searchError}</p>}
            {searchResult && (
              <div className="rounded-lg bg-muted p-4">
                <pre className="text-sm overflow-auto">{JSON.stringify(searchResult, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 상품 연결 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              상품-카테고리 연결
            </CardTitle>
            <CardDescription>상품을 카테고리에 연결합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>상품 선택</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="상품을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {items?.map((item, index) => (
                    <SelectItem key={item.id ?? `item-${index}`} value={String(item.id)}>
                      {item.name} (ID: {item.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>카테고리명</Label>
              <Input
                placeholder="연결할 카테고리명"
                value={connectCategoryName}
                onChange={(e) => setConnectCategoryName(e.target.value)}
              />
            </div>
            <Button onClick={handleConnectItem} className="w-full">
              연결
            </Button>
          </CardContent>
        </Card>

        {/* 하위 카테고리 추가 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              하위 카테고리 추가
            </CardTitle>
            <CardDescription>카테고리에 하위 카테고리를 추가합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>대상 카테고리명 (부모)</Label>
              <Input
                placeholder="부모 카테고리명"
                value={targetCategoryName}
                onChange={(e) => setTargetCategoryName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>하위 카테고리명</Label>
              <Input
                placeholder="추가할 하위 카테고리명"
                value={childCategoryName}
                onChange={(e) => setChildCategoryName(e.target.value)}
              />
            </div>
            <Button
              onClick={handleAddChild}
              className="w-full"
              disabled={!targetCategoryName || !childCategoryName}
            >
              하위 카테고리 추가
            </Button>
          </CardContent>
        </Card>

        {/* 상위 카테고리 추가 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              상위 카테고리 추가
            </CardTitle>
            <CardDescription>카테고리에 상위 카테고리를 추가합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>대상 카테고리명 (자식)</Label>
              <Input
                placeholder="자식 카테고리명"
                value={targetCategoryName}
                onChange={(e) => setTargetCategoryName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>상위 카테고리명</Label>
              <Input
                placeholder="추가할 상위 카테고리명"
                value={parentCategoryName}
                onChange={(e) => setParentCategoryName(e.target.value)}
              />
            </div>
            <Button
              onClick={handleAddParent}
              className="w-full"
              disabled={!targetCategoryName || !parentCategoryName}
            >
              상위 카테고리 추가
            </Button>
          </CardContent>
        </Card>

        {/* 카테고리 삭제 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              카테고리 삭제
            </CardTitle>
            <CardDescription>카테고리를 삭제합니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="삭제할 카테고리명"
                value={deleteCategoryName}
                onChange={(e) => setDeleteCategoryName(e.target.value)}
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={!deleteCategoryName}>
                    삭제
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>카테고리 삭제</AlertDialogTitle>
                    <AlertDialogDescription>
                      정말로 &quot;{deleteCategoryName}&quot; 카테고리를 삭제하시겠습니까? 이 작업은 되돌릴 수
                      없습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteCategory}>삭제</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

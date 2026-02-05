"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { categoryApi, type Category } from "@/lib/api";
import { Plus, Trash2, FolderUp, FolderDown, Search, Folder } from "lucide-react";

const categoriesFetcher = () => categoryApi.getAllFlat();

export default function CategoriesPage() {
  const router = useRouter();
  const { data: categories, mutate } = useSWR("categories-flat", categoriesFetcher);

  useEffect(() => {
    const userType = localStorage.getItem("user_type");
    if (userType === "member") {
      router.replace("/shop");
    }
  }, [router]);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAddParentOpen, setIsAddParentOpen] = useState(false);
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);

  // Create form
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDes, setNewCategoryDes] = useState("");

  // Add parent/child form
  const [parentCategoryName, setParentCategoryName] = useState("");
  const [childCategoryName, setChildCategoryName] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const showMessage = (msg: string, type: "success" | "error") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  // Filter categories by search keyword
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!searchKeyword.trim()) return categories;
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [categories, searchKeyword]);

  const handleCreateCategory = async () => {
    if (!newCategoryName || !newCategoryDes) {
      showMessage("카테고리명과 설명을 입력해주세요.", "error");
      return;
    }
    try {
      await categoryApi.create(newCategoryName, newCategoryDes);
      showMessage("카테고리가 생성되었습니다.", "success");
      setIsCreateOpen(false);
      setNewCategoryName("");
      setNewCategoryDes("");
      mutate();
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "카테고리 생성에 실패했습니다.", "error");
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    try {
      await categoryApi.delete(selectedCategory.name);
      showMessage("카테고리가 삭제되었습니다.", "success");
      setSelectedCategory(null);
      mutate();
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "카테고리 삭제에 실패했습니다.", "error");
    }
  };

  const handleAddParent = async () => {
    if (!selectedCategory || !parentCategoryName) {
      showMessage("상위 카테고리명을 입력해주세요.", "error");
      return;
    }
    try {
      await categoryApi.addParent(selectedCategory.name, parentCategoryName);
      showMessage("상위 카테고리가 추가되었습니다.", "success");
      setIsAddParentOpen(false);
      setParentCategoryName("");
      mutate();
      // Refresh selected category
      const updated = await categoryApi.getById(selectedCategory.id);
      setSelectedCategory(updated);
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "상위 카테고리 추가에 실패했습니다.", "error");
    }
  };

  const handleAddChild = async () => {
    if (!selectedCategory || !childCategoryName) {
      showMessage("하위 카테고리명을 입력해주세요.", "error");
      return;
    }
    try {
      await categoryApi.addChild(selectedCategory.name, childCategoryName);
      showMessage("하위 카테고리가 추가되었습니다.", "success");
      setIsAddChildOpen(false);
      setChildCategoryName("");
      mutate();
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "하위 카테고리 추가에 실패했습니다.", "error");
    }
  };

  // Find parent category name
  const getParentName = (parentId?: number) => {
    if (!parentId || !categories) return null;
    const parent = categories.find((cat) => cat.id === parentId);
    return parent?.name || null;
  };

  // Find children
  const getChildren = (categoryId: number) => {
    if (!categories) return [];
    return categories.filter((cat) => cat.parent_id === categoryId);
  };

  return (
    <DashboardLayout>
      <PageHeader title="카테고리 관리" description="카테고리를 조회하고 관리합니다">
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
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="카테고리명"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ca-des">설명 *</Label>
                <Textarea
                  id="ca-des"
                  value={newCategoryDes}
                  onChange={(e) => setNewCategoryDes(e.target.value)}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Search and List */}
        <div className="space-y-4">
          {/* Search */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="h-4 w-4" />
                카테고리 이름 검색
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="카테고리 이름으로 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Category List */}
          <Card className="min-h-[400px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                카테고리 목록
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  (클릭하여 선택)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-[350px] overflow-y-auto">
                {filteredCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    {searchKeyword ? "검색 결과가 없습니다." : "카테고리가 없습니다."}
                  </p>
                ) : (
                  filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedCategory?.id === category.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      <Folder className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{category.name}</p>
                        <p
                          className={`text-xs truncate ${
                            selectedCategory?.id === category.id
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {category.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Selected Category Details */}
        <div className="space-y-4">
          <Card className="min-h-[400px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">선택된 카테고리</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCategory ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold text-lg">{selectedCategory.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedCategory.description}
                    </p>
                    <div className="mt-3 text-sm space-y-1">
                      <p>
                        <span className="text-muted-foreground">ID:</span> {selectedCategory.id}
                      </p>
                      {selectedCategory.parent_id && (
                        <p>
                          <span className="text-muted-foreground">상위 카테고리:</span>{" "}
                          {getParentName(selectedCategory.parent_id)}
                        </p>
                      )}
                      {getChildren(selectedCategory.id).length > 0 && (
                        <div>
                          <span className="text-muted-foreground">하위 카테고리:</span>{" "}
                          {getChildren(selectedCategory.id)
                            .map((c) => c.name)
                            .join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  왼쪽에서 카테고리를 선택하세요
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={!selectedCategory}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>카테고리 삭제</AlertDialogTitle>
                  <AlertDialogDescription>
                    정말로 &quot;{selectedCategory?.name}&quot; 카테고리를 삭제하시겠습니까? 이
                    작업은 되돌릴 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteCategory}>삭제</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isAddParentOpen} onOpenChange={setIsAddParentOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" disabled={!selectedCategory}>
                  <FolderUp className="mr-2 h-4 w-4" />
                  부모 추가
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>상위 카테고리 추가</DialogTitle>
                  <DialogDescription>
                    &quot;{selectedCategory?.name}&quot;의 상위 카테고리를 설정합니다.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>상위 카테고리명</Label>
                    <Input
                      placeholder="상위 카테고리명 입력"
                      value={parentCategoryName}
                      onChange={(e) => setParentCategoryName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddParentOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleAddParent}>추가</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddChildOpen} onOpenChange={setIsAddChildOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" disabled={!selectedCategory}>
                  <FolderDown className="mr-2 h-4 w-4" />
                  자식 추가
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>하위 카테고리 추가</DialogTitle>
                  <DialogDescription>
                    &quot;{selectedCategory?.name}&quot;의 하위 카테고리를 설정합니다.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>하위 카테고리명</Label>
                    <Input
                      placeholder="하위 카테고리명 입력"
                      value={childCategoryName}
                      onChange={(e) => setChildCategoryName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddChildOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleAddChild}>추가</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

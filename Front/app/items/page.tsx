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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { itemApi, categoryApi, type Item, type BookCreate, type AlbumCreate, type MovieCreate, type ItemUpdate, type Category } from "@/lib/api";
import { Plus, Pencil, Trash2, Book as BookIcon, Disc, Film, Upload, ImageIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Tag, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fetcher = () => itemApi.getAll();

type ItemType = "book" | "album" | "movie";
type FilterType = "all" | "BOOK" | "ALBUM" | "MOVIE";

const ITEMS_PER_PAGE = 20;

export default function ItemsPage() {
  const router = useRouter();
  const { data: items, error, isLoading, mutate } = useSWR("items", fetcher);

  useEffect(() => {
    const userType = localStorage.getItem("user_type");
    if (userType === "member") {
      router.replace("/shop");
    }
  }, [router]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itemType, setItemType] = useState<ItemType>("book");
  const [errorMsg, setErrorMsg] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Form fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState(0);
  const [artist, setArtist] = useState("");
  const [etc, setEtc] = useState("");
  const [director, setDirector] = useState("");
  const [actor, setActor] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Category states for edit dialog
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [itemCategories, setItemCategories] = useState<Category[]>([]);
  const [selectedCategoryToAdd, setSelectedCategoryToAdd] = useState<string>("");

  const resetForm = () => {
    setName("");
    setPrice(0);
    setStock(0);
    setAuthor("");
    setIsbn(0);
    setArtist("");
    setEtc("");
    setDirector("");
    setActor("");
    setImageUrl("");
    setImageFile(null);
    setItemType("book");
    setErrorMsg("");
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await itemApi.uploadImage(file);
      setImageUrl(result.url);
      setImageFile(file);
    } catch (e) {
      setErrorMsg("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!name) {
      setErrorMsg("상품명을 입력해주세요.");
      return;
    }

    try {
      if (itemType === "book") {
        if (!author) {
          setErrorMsg("저자를 입력해주세요.");
          return;
        }
        const data: BookCreate = { name, price, stock, author, isbn, image_url: imageUrl || undefined };
        await itemApi.createBook(data);
      } else if (itemType === "album") {
        if (!artist) {
          setErrorMsg("아티스트를 입력해주세요.");
          return;
        }
        const data: AlbumCreate = { name, price, stock, artist, etc: etc || undefined, image_url: imageUrl || undefined };
        await itemApi.createAlbum(data);
      } else {
        if (!director || !actor) {
          setErrorMsg("감독과 배우를 입력해주세요.");
          return;
        }
        const data: MovieCreate = { name, price, stock, director, actor, image_url: imageUrl || undefined };
        await itemApi.createMovie(data);
      }

      mutate();
      setIsCreateOpen(false);
      resetForm();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "상품 생성에 실패했습니다.");
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem?.id) return;
    try {
      const data: ItemUpdate = { name, price, stock, image_url: imageUrl || undefined };
      await itemApi.update(selectedItem.id, data);
      mutate();
      setIsEditOpen(false);
      setSelectedItem(null);
      resetForm();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "상품 수정에 실패했습니다.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await itemApi.delete(id);
      mutate();
    } catch (e) {
      console.error("Failed to delete item:", e);
    }
  };

  const openEditDialog = async (item: Item) => {
    setSelectedItem(item);
    setName(item.name);
    setPrice(item.price);
    setStock(item.stock);
    setImageUrl(item.image_url || "");
    setErrorMsg("");
    setSelectedCategoryToAdd("");

    // Fetch all categories and item's categories
    try {
      const [allCats, itemCats] = await Promise.all([
        categoryApi.getAllFlat(),
        categoryApi.getByItemId(item.id)
      ]);
      setAllCategories(allCats);
      setItemCategories(itemCats);
    } catch (e) {
      console.error("Failed to fetch categories:", e);
      setAllCategories([]);
      setItemCategories([]);
    }

    setIsEditOpen(true);
  };

  const handleAddCategory = async () => {
    if (!selectedItem?.id || !selectedCategoryToAdd) return;

    try {
      await categoryApi.connectItem(selectedItem.id, selectedCategoryToAdd);
      // Refresh item categories
      const updatedCats = await categoryApi.getByItemId(selectedItem.id);
      setItemCategories(updatedCats);
      setSelectedCategoryToAdd("");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "카테고리 연결에 실패했습니다.");
    }
  };

  const handleRemoveCategory = async (categoryName: string) => {
    if (!selectedItem?.id) return;

    try {
      await categoryApi.disconnectItem(selectedItem.id, categoryName);
      // Refresh item categories
      const updatedCats = await categoryApi.getByItemId(selectedItem.id);
      setItemCategories(updatedCats);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "카테고리 연결 해제에 실패했습니다.");
    }
  };

  // Get available categories (not already connected to item)
  const availableCategories = allCategories.filter(
    (cat) => !itemCategories.some((ic) => ic.id === cat.id)
  );

  const getItemTypeBadge = (type?: string) => {
    switch (type?.toUpperCase()) {
      case "BOOK":
        return (
          <Badge variant="secondary" className="gap-1">
            <BookIcon className="h-3 w-3" /> 도서
          </Badge>
        );
      case "ALBUM":
        return (
          <Badge variant="secondary" className="gap-1">
            <Disc className="h-3 w-3" /> 앨범
          </Badge>
        );
      case "MOVIE":
        return (
          <Badge variant="secondary" className="gap-1">
            <Film className="h-3 w-3" /> 영화
          </Badge>
        );
      default:
        return <Badge variant="outline">기타</Badge>;
    }
  };

  // 필터링된 상품
  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (filterType === "all") return items;
    return items.filter((item) => item.type === filterType);
  }, [items, filterType]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  // 필터 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType]);

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    if (totalPages <= 10) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let startPage = Math.max(1, currentPage - 4);
    let endPage = Math.min(totalPages, startPage + 9);
    if (endPage - startPage < 9) {
      startPage = Math.max(1, endPage - 9);
    }
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  return (
    <DashboardLayout>
      <PageHeader title="상품 관리" description="상품 정보를 조회하고 관리합니다">
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              상품 등록
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 상품 등록</DialogTitle>
              <DialogDescription>새로운 상품 정보를 입력하세요.</DialogDescription>
            </DialogHeader>
            {errorMsg && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                {errorMsg}
              </div>
            )}
            <Tabs value={itemType} onValueChange={(v) => setItemType(v as ItemType)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="book">도서</TabsTrigger>
                <TabsTrigger value="album">앨범</TabsTrigger>
                <TabsTrigger value="movie">영화</TabsTrigger>
              </TabsList>
              <div className="mt-4 grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">상품명 *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="상품명"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">가격</Label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      placeholder="가격"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock">재고 수량</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    placeholder="재고 수량"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>상품 이미지</Label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50">
                      <Upload className="h-4 w-4" />
                      <span>{isUploading ? "업로드 중..." : "이미지 선택"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                    </label>
                    {imageUrl && (
                      <div className="flex items-center gap-2">
                        <img
                          src={`http://localhost:8000${imageUrl}`}
                          alt="미리보기"
                          className="w-16 h-16 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => { setImageUrl(""); setImageFile(null); }}
                        >
                          삭제
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <TabsContent value="book" className="mt-0 grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="author">저자 *</Label>
                      <Input
                        id="author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="저자"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input
                        id="isbn"
                        type="number"
                        value={isbn}
                        onChange={(e) => setIsbn(Number(e.target.value))}
                        placeholder="ISBN"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="album" className="mt-0 grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="artist">아티스트 *</Label>
                      <Input
                        id="artist"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        placeholder="아티스트"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="etc">기타 정보</Label>
                      <Input
                        id="etc"
                        value={etc}
                        onChange={(e) => setEtc(e.target.value)}
                        placeholder="기타 정보"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="movie" className="mt-0 grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="director">감독 *</Label>
                      <Input
                        id="director"
                        value={director}
                        onChange={(e) => setDirector(e.target.value)}
                        placeholder="감독"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="actor">배우 *</Label>
                      <Input
                        id="actor"
                        value={actor}
                        onChange={(e) => setActor(e.target.value)}
                        placeholder="배우"
                      />
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
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
          <div className="flex items-center justify-between">
            <CardTitle>상품 목록</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
              >
                전체
              </Button>
              <Button
                variant={filterType === "BOOK" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("BOOK")}
              >
                <BookIcon className="h-4 w-4 mr-1" />
                도서
              </Button>
              <Button
                variant={filterType === "ALBUM" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("ALBUM")}
              >
                <Disc className="h-4 w-4 mr-1" />
                앨범
              </Button>
              <Button
                variant={filterType === "MOVIE" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("MOVIE")}
              >
                <Film className="h-4 w-4 mr-1" />
                영화
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-muted-foreground">로딩 중...</p>}
          {error && <p className="text-destructive">데이터를 불러오는데 실패했습니다. 백엔드 서버를 확인하세요.</p>}
          {filteredItems.length === 0 && !isLoading && (
            <p className="text-muted-foreground">
              {filterType === "all" ? "등록된 상품이 없습니다." : "해당 유형의 상품이 없습니다."}
            </p>
          )}
          {paginatedItems.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>이미지</TableHead>
                  <TableHead>상품명</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>가격</TableHead>
                  <TableHead>재고</TableHead>
                  <TableHead>상세정보</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((item, index) => (
                  <TableRow key={item.id ?? `item-${index}`}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>
                      {item.image_url ? (
                        <img
                          src={`http://localhost:8000${item.image_url}`}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{getItemTypeBadge(item.type)}</TableCell>
                    <TableCell>{item.price.toLocaleString()}원</TableCell>
                    <TableCell>{item.stock}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[250px]">
                      <div className="space-y-1">
                        <div>
                          {item.type === "BOOK" && item.author && `저자: ${item.author}`}
                          {item.type === "ALBUM" && item.artist && `아티스트: ${item.artist}`}
                          {item.type === "MOVIE" && item.director && `감독: ${item.director}`}
                        </div>
                        {item.categories && item.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs">카테고리:</span>
                            {item.categories.map((cat) => (
                              <Badge key={cat.id} variant="outline" className="text-xs px-1 py-0">
                                {cat.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(item)}
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
                              <AlertDialogTitle>상품 삭제</AlertDialogTitle>
                              <AlertDialogDescription>
                                정말로 &quot;{item.name}&quot; 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction onClick={() => item.id && handleDelete(item.id)}>
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

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {getPageNumbers().map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>상품 정보 수정</DialogTitle>
            <DialogDescription>상품의 기본 정보와 카테고리를 수정할 수 있습니다.</DialogDescription>
          </DialogHeader>
          {errorMsg && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {errorMsg}
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">상품명</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="상품명"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price">가격</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="가격"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-stock">재고 수량</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  placeholder="재고 수량"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>상품 이미지</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50">
                  <Upload className="h-4 w-4" />
                  <span>{isUploading ? "업로드 중..." : "이미지 변경"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                </label>
                {imageUrl && (
                  <div className="flex items-center gap-2">
                    <img
                      src={`http://localhost:8000${imageUrl}`}
                      alt="미리보기"
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => { setImageUrl(""); setImageFile(null); }}
                    >
                      삭제
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Category Management Section */}
            <div className="grid gap-2 pt-4 border-t">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                카테고리 관리
              </Label>

              {/* Current Categories */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">현재 연결된 카테고리:</p>
                <div className="flex flex-wrap gap-2 min-h-[32px]">
                  {itemCategories.length === 0 ? (
                    <span className="text-sm text-muted-foreground">연결된 카테고리가 없습니다.</span>
                  ) : (
                    itemCategories.map((cat) => (
                      <Badge key={cat.id} variant="secondary" className="flex items-center gap-1">
                        {cat.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(cat.name)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              {/* Add Category */}
              <div className="flex gap-2 mt-2">
                <Select value={selectedCategoryToAdd} onValueChange={setSelectedCategoryToAdd}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.length === 0 ? (
                      <SelectItem value="__none__" disabled>추가 가능한 카테고리가 없습니다</SelectItem>
                    ) : (
                      availableCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCategory}
                  disabled={!selectedCategoryToAdd || selectedCategoryToAdd === "__none__"}
                >
                  추가
                </Button>
              </div>
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
    </DashboardLayout>
  );
}

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { itemApi, type Item, type BookCreate, type AlbumCreate, type MovieCreate, type ItemUpdate } from "@/lib/api";
import { Plus, Pencil, Trash2, Book as BookIcon, Disc, Film } from "lucide-react";

const fetcher = () => itemApi.getAll();

type ItemType = "book" | "album" | "movie";

export default function ItemsPage() {
  const router = useRouter();
  const { data: items, error, isLoading, mutate } = useSWR("items", fetcher);

  useEffect(() => {
    const userType = localStorage.getItem("user_type");
    if (userType === "member") {
      router.replace("/orders");
    }
  }, [router]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itemType, setItemType] = useState<ItemType>("book");
  const [errorMsg, setErrorMsg] = useState("");

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
    setItemType("book");
    setErrorMsg("");
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
        const data: BookCreate = { name, price, stock, author, isbn };
        await itemApi.createBook(data);
      } else if (itemType === "album") {
        if (!artist) {
          setErrorMsg("아티스트를 입력해주세요.");
          return;
        }
        const data: AlbumCreate = { name, price, stock, artist, etc: etc || undefined };
        await itemApi.createAlbum(data);
      } else {
        if (!director || !actor) {
          setErrorMsg("감독과 배우를 입력해주세요.");
          return;
        }
        const data: MovieCreate = { name, price, stock, director, actor };
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
      const data: ItemUpdate = { name, price, stock };
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

  const openEditDialog = (item: Item) => {
    setSelectedItem(item);
    setName(item.name);
    setPrice(item.price);
    setStock(item.stock);
    setErrorMsg("");
    setIsEditOpen(true);
  };

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
          <CardTitle>상품 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-muted-foreground">로딩 중...</p>}
          {error && <p className="text-destructive">데이터를 불러오는데 실패했습니다. 백엔드 서버를 확인하세요.</p>}
          {items && items.length === 0 && (
            <p className="text-muted-foreground">등록된 상품이 없습니다.</p>
          )}
          {items && items.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>상품명</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>가격</TableHead>
                  <TableHead>재고</TableHead>
                  <TableHead>상세정보</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id ?? `item-${index}`}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{getItemTypeBadge(item.type)}</TableCell>
                    <TableCell>{item.price.toLocaleString()}원</TableCell>
                    <TableCell>{item.stock}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.type === "BOOK" && item.author && `저자: ${item.author}`}
                      {item.type === "ALBUM" && item.artist && `아티스트: ${item.artist}`}
                      {item.type === "MOVIE" && item.director && `감독: ${item.director}`}
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
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>상품 정보 수정</DialogTitle>
            <DialogDescription>상품의 기본 정보(이름, 가격, 재고)를 수정할 수 있습니다.</DialogDescription>
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

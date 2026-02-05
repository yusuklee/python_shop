"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { itemApi, categoryApi, type Item, type Category } from "@/lib/api";
import { Search, ShoppingCart, ImageIcon, Book as BookIcon, Disc, Film, Plus, Minus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown, ChevronUp, Sparkles, TrendingUp, Package } from "lucide-react";
import { cn } from "@/lib/utils";

type ItemTypeFilter = "all" | "BOOK" | "ALBUM" | "MOVIE";

interface CartItem {
  item_id: number;
  count: number;
}

// 카테고리 트리 아이템 컴포넌트
function CategoryTreeItem({
  category,
  selectedCategory,
  expandedCategories,
  onSelect,
  onToggle,
  depth = 0,
}: {
  category: Category;
  selectedCategory: string;
  expandedCategories: Set<number>;
  onSelect: (id: string) => void;
  onToggle: (id: number) => void;
  depth?: number;
}) {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedCategories.has(category.id);
  const isSelected = selectedCategory === category.id.toString();

  const handleClick = () => {
    onSelect(category.id.toString());
    if (hasChildren) {
      onToggle(category.id);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all duration-200 text-left group",
          isSelected
            ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium shadow-md"
            : "hover:bg-primary/10 hover:translate-x-1",
          depth > 0 && !isSelected && "text-muted-foreground"
        )}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <span className="truncate">{category.name}</span>
        {hasChildren && (
          <span className={cn(
            "ml-2 flex-shrink-0 transition-transform duration-200",
            isExpanded && "rotate-180"
          )}>
            <ChevronDown className="h-4 w-4" />
          </span>
        )}
      </button>
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        hasChildren && isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        {hasChildren && category.children!.map((child) => (
          <CategoryTreeItem
            key={child.id}
            category={child}
            selectedCategory={selectedCategory}
            expandedCategories={expandedCategories}
            onSelect={onSelect}
            onToggle={onToggle}
            depth={depth + 1}
          />
        ))}
      </div>
    </div>
  );
}

export default function ShopPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ItemTypeFilter>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // 회원만 접근 가능
  useEffect(() => {
    const userType = localStorage.getItem("user_type");
    if (userType === "admin") {
      router.replace("/");
    }
  }, [router]);

  // 로컬 스토리지에서 장바구니 로드
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // 카테고리 목록 로드
  useEffect(() => {
    categoryApi.getAll().then(setCategories).catch(console.error);
  }, []);

  // 아이템 로드 (카테고리/타입 필터에 따라)
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let data: Item[];
        if (selectedCategory === "all") {
          data = await itemApi.getAll();
          // 타입 필터는 클라이언트에서 적용
          if (typeFilter !== "all") {
            data = data.filter((item) => item.type === typeFilter);
          }
        } else {
          // 카테고리가 선택된 경우 서버에서 필터링
          const categoryId = parseInt(selectedCategory);
          data = await itemApi.getByCategory(
            categoryId,
            typeFilter !== "all" ? typeFilter : undefined
          );
        }
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch items"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, [selectedCategory, typeFilter]);

  // 장바구니 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const filteredItems = useMemo(() => {
    if (!items) return [];

    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [items, searchQuery]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  // 필터 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, selectedCategory]);

  // 페이지 번호 배열 생성 (실제 페이지 수에 맞게, 최대 10개까지만 표시)
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

  const getCartItemCount = (itemId: number) => {
    const cartItem = cart.find((c) => c.item_id === itemId);
    return cartItem?.count || 0;
  };

  const getTotalCartCount = () => {
    return cart.reduce((sum, item) => sum + item.count, 0);
  };

  const addToCart = (itemId: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item_id === itemId);
      if (existing) {
        return prev.map((c) =>
          c.item_id === itemId ? { ...c, count: c.count + 1 } : c
        );
      }
      return [...prev, { item_id: itemId, count: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item_id === itemId);
      if (existing && existing.count > 1) {
        return prev.map((c) =>
          c.item_id === itemId ? { ...c, count: c.count - 1 } : c
        );
      }
      return prev.filter((c) => c.item_id !== itemId);
    });
  };

  const goToCart = () => {
    router.push("/orders");
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleCategoryToggle = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getTypeIcon = (type?: string) => {
    switch (type?.toUpperCase()) {
      case "BOOK":
        return <BookIcon className="h-4 w-4" />;
      case "ALBUM":
        return <Disc className="h-4 w-4" />;
      case "MOVIE":
        return <Film className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeName = (type?: string) => {
    switch (type?.toUpperCase()) {
      case "BOOK":
        return "도서";
      case "ALBUM":
        return "앨범";
      case "MOVIE":
        return "영화";
      default:
        return "기타";
    }
  };

  // 선택된 카테고리 이름 가져오기
  const getSelectedCategoryName = () => {
    if (selectedCategory === "all") return "전체 상품";
    const findCategory = (cats: Category[]): string | null => {
      for (const cat of cats) {
        if (cat.id.toString() === selectedCategory) return cat.name;
        if (cat.children) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findCategory(categories) || "전체 상품";
  };

  return (
    <DashboardLayout>
      <div className="flex gap-6">
        {/* 왼쪽 카테고리 사이드바 */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <div className="sticky top-4">
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="bg-gradient-to-r from-primary to-primary/80 p-4">
                <h2 className="font-bold text-lg text-primary-foreground flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  카테고리
                </h2>
              </div>
              <CardContent className="p-3">
                <nav className="space-y-1">
                  {/* 전체 */}
                  <button
                    onClick={() => handleCategorySelect("all")}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 text-left",
                      selectedCategory === "all"
                        ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium shadow-md"
                        : "hover:bg-primary/10 hover:translate-x-1"
                    )}
                  >
                    <Sparkles className="h-4 w-4" />
                    전체 상품
                  </button>
                  {/* 카테고리 트리 */}
                  {categories.map((category) => (
                    <CategoryTreeItem
                      key={category.id}
                      category={category}
                      selectedCategory={selectedCategory}
                      expandedCategories={expandedCategories}
                      onSelect={handleCategorySelect}
                      onToggle={handleCategoryToggle}
                    />
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* 장바구니 미니 위젯 */}
            {getTotalCartCount() > 0 && (
              <Card className="mt-4 overflow-hidden border-0 shadow-lg">
                <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-4">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    장바구니
                  </h3>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    <span className="font-bold text-foreground text-lg">{getTotalCartCount()}</span>개 상품이 담겨있습니다
                  </p>
                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500"
                    onClick={goToCart}
                  >
                    주문하러 가기
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </aside>

        {/* 오른쪽 메인 콘텐츠 */}
        <main className="flex-1 min-w-0">
          {/* 상단 헤더 */}
          <div className="mb-6">
            {/* 타이틀 + 장바구니 */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  {getSelectedCategoryName()}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  총 <span className="font-semibold text-primary">{filteredItems.length}</span>개의 상품
                </p>
              </div>
              <Button
                variant="outline"
                className="relative border-2 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={goToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                장바구니
                {getTotalCartCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-orange-500 to-orange-400 border-0">
                    {getTotalCartCount()}
                  </Badge>
                )}
              </Button>
            </div>

            {/* 검색창 */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="상품명을 검색하세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base border-2 focus:border-primary rounded-xl"
              />
            </div>

            {/* 타입 필터 */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={typeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("all")}
                className={cn(
                  "rounded-full px-4 transition-all",
                  typeFilter === "all" && "bg-gradient-to-r from-primary to-primary/80 shadow-md"
                )}
              >
                전체
              </Button>
              <Button
                variant={typeFilter === "BOOK" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("BOOK")}
                className={cn(
                  "rounded-full px-4 transition-all",
                  typeFilter === "BOOK" && "bg-gradient-to-r from-blue-500 to-blue-400 shadow-md"
                )}
              >
                <BookIcon className="h-4 w-4 mr-1" />
                도서
              </Button>
              <Button
                variant={typeFilter === "ALBUM" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("ALBUM")}
                className={cn(
                  "rounded-full px-4 transition-all",
                  typeFilter === "ALBUM" && "bg-gradient-to-r from-purple-500 to-purple-400 shadow-md"
                )}
              >
                <Disc className="h-4 w-4 mr-1" />
                앨범
              </Button>
              <Button
                variant={typeFilter === "MOVIE" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("MOVIE")}
                className={cn(
                  "rounded-full px-4 transition-all",
                  typeFilter === "MOVIE" && "bg-gradient-to-r from-red-500 to-red-400 shadow-md"
                )}
              >
                <Film className="h-4 w-4 mr-1" />
                영화
              </Button>
            </div>
          </div>

          {/* 로딩 상태 */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
              <p className="text-muted-foreground">상품을 불러오는 중...</p>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="flex flex-col items-center py-12">
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <Package className="h-8 w-8 text-destructive" />
                </div>
                <p className="text-destructive font-medium">데이터를 불러오는데 실패했습니다</p>
                <p className="text-sm text-muted-foreground mt-1">백엔드 서버를 확인하세요</p>
              </CardContent>
            </Card>
          )}

          {/* 빈 상태 */}
          {filteredItems && filteredItems.length === 0 && !isLoading && !error && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center py-16">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Package className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="font-medium text-lg">
                  {searchQuery || typeFilter !== "all" || selectedCategory !== "all"
                    ? "검색 결과가 없습니다"
                    : "등록된 상품이 없습니다"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  다른 검색어나 필터를 시도해보세요
                </p>
              </CardContent>
            </Card>
          )}

          {/* 상품 그리드 */}
          {!isLoading && !error && paginatedItems.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {paginatedItems.map((item, index) => (
                <Card
                  key={item.id ?? `item-${index}`}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group border-0 shadow-md hover:-translate-y-1"
                >
                  <div className="aspect-square relative bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={`http://localhost:8000${item.image_url}`}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                    <Badge
                      className={cn(
                        "absolute top-2 left-2 gap-1 text-xs border-0 shadow-sm",
                        item.type === "BOOK" && "bg-gradient-to-r from-blue-500 to-blue-400",
                        item.type === "ALBUM" && "bg-gradient-to-r from-purple-500 to-purple-400",
                        item.type === "MOVIE" && "bg-gradient-to-r from-red-500 to-red-400"
                      )}
                    >
                      {getTypeIcon(item.type)}
                      {getTypeName(item.type)}
                    </Badge>
                    {item.stock === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">품절</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3 flex flex-col flex-1">
                    <h3 className="font-medium text-sm line-clamp-2 mb-1 h-10 group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2 h-4 truncate">
                      {item.type === "BOOK" && item.author && `저자: ${item.author}`}
                      {item.type === "ALBUM" && item.artist && `아티스트: ${item.artist}`}
                      {item.type === "MOVIE" && item.director && `감독: ${item.director}`}
                    </p>
                    <p className="text-lg font-bold text-primary mb-1">
                      {item.price.toLocaleString()}
                      <span className="text-sm font-normal">원</span>
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      재고: {item.stock}개
                    </p>

                    {/* 장바구니 버튼 */}
                    <div className="mt-auto">
                      {getCartItemCount(item.id) === 0 ? (
                        <Button
                          className={cn(
                            "w-full transition-all",
                            item.stock > 0 && "bg-gradient-to-r from-primary to-primary/80 hover:shadow-md"
                          )}
                          size="sm"
                          onClick={() => addToCart(item.id)}
                          disabled={item.stock === 0}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          {item.stock === 0 ? "품절" : "담기"}
                        </Button>
                      ) : (
                        <div className="flex items-center justify-between gap-1 bg-primary/10 rounded-lg p-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="h-8 w-8 p-0 hover:bg-primary/20"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-bold text-primary">{getCartItemCount(item.id)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addToCart(item.id)}
                            disabled={getCartItemCount(item.id) >= item.stock}
                            className="h-8 w-8 p-0 hover:bg-primary/20"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-8 pb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="h-9 w-9 p-0 rounded-full"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-9 w-9 p-0 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {getPageNumbers().map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "h-9 w-9 p-0 rounded-full transition-all",
                    currentPage === page && "bg-gradient-to-r from-primary to-primary/80 shadow-md"
                  )}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-9 w-9 p-0 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-9 w-9 p-0 rounded-full"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}

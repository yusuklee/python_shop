"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { memberApi } from "@/lib/api";
import { LogIn } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    if (email.length < 5 || email.length > 30) {
      setErrorMsg("이메일은 5-30자 사이여야 합니다.");
      return;
    }

    if (password.length < 3 || password.length > 30) {
      setErrorMsg("비밀번호는 3-30자 사이여야 합니다.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await memberApi.login({ email, password });
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("token_type", response.token_type);
      localStorage.setItem("user_type", response.user_type);
      localStorage.setItem("user_info", JSON.stringify(response.user));
      // 회원은 아이템 목록 페이지로, 관리자는 대시보드로
      if (response.user_type === "member") {
        router.push("/shop");
      } else {
        router.push("/");
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex pattern-bg">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-sidebar items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="flex justify-center mb-8">
            <div className="flex h-24 w-24 items-center justify-center rounded-full overflow-hidden bg-white/20 backdrop-blur-sm">
              <Image
                src="/logo.webp"
                alt="알빠노 SHOP"
                width={96}
                height={96}
                className="object-cover"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">알빠노 SHOP</h1>
          <p className="text-lg text-white/80">
            쇼핑몰 관리 시스템에 오신 것을 환영합니다.
            회원, 상품, 주문을 한 곳에서 관리하세요.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4 lg:hidden">
              <div className="flex h-16 w-16 items-center justify-center rounded-full overflow-hidden">
                <Image
                  src="/logo.webp"
                  alt="알빠노 SHOP"
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">알빠노 SHOP</CardTitle>
            <CardDescription>계정으로 로그인하세요</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleLogin} className="grid gap-4">
              {errorMsg && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                  {errorMsg}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-11 mt-2" disabled={isLoading}>
                <LogIn className="mr-2 h-4 w-4" />
                {isLoading ? "로그인 중..." : "로그인"}
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-2">
                계정이 없으신가요?{" "}
                <Link href="/signup" className="text-primary font-medium hover:underline">
                  회원가입
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

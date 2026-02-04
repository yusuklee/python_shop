"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { memberApi, type MemberCreate } from "@/lib/api";
import { UserPlus, Store } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<MemberCreate>({
    name: "",
    email: "",
    password: "",
    zip: "",
    addr1: "",
    addr2: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

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

    setIsLoading(true);
    try {
      await memberApi.create(formData);
      router.push("/login");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "회원가입에 실패했습니다.");
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
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Store className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Shop Admin</h1>
          <p className="text-lg text-white/80">
            새로운 관리자 계정을 만들고
            쇼핑몰 관리를 시작하세요.
          </p>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4 lg:hidden">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-sidebar">
                <Store className="h-7 w-7 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
            <CardDescription>새 계정을 만드세요</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSignup} className="grid gap-4">
              {errorMsg && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                  {errorMsg}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="이름"
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="이메일"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="비밀번호 (5-20자)"
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zip">우편번호</Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  placeholder="우편번호"
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="addr1">주소</Label>
                  <Input
                    id="addr1"
                    value={formData.addr1}
                    onChange={(e) => setFormData({ ...formData, addr1: e.target.value })}
                    placeholder="기본 주소"
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="addr2">상세 주소</Label>
                  <Input
                    id="addr2"
                    value={formData.addr2}
                    onChange={(e) => setFormData({ ...formData, addr2: e.target.value })}
                    placeholder="상세 주소"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 mt-2" disabled={isLoading}>
                <UserPlus className="mr-2 h-4 w-4" />
                {isLoading ? "가입 중..." : "회원가입"}
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-2">
                이미 계정이 있으신가요?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  로그인
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

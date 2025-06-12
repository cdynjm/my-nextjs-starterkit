"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (res?.ok) router.push("/dashboard");
  };

  return (
    <div>
      <h6 className="mx-auto mx-w-md space-y-4 p-4">LogIn</h6>
    <form onSubmit={handleLogin} className="max-w-md mx-auto space-y-4 p-4">
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full p-2 border"
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="w-full p-2 border"
      />
      <Button type="submit">Login</Button>
    </form>
    <div className="max-w-md mx-auto space-y-4 p-4">
      <Link href="/register">Register</Link>
    </div>
    </div>
  );
}

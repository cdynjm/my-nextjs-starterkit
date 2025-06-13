"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 mr-2 text-white inline-block"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    const errors: { name?: string; email?: string; password?: string } = {};
    if (!form.name.trim()) 
      errors.name = "Name is required.";
    if (!form.email.trim()) 
      errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) 
      errors.email = "Email is invalid.";
    if (!form.password.trim()) 
      errors.password = "Password is required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        router.push("/");
      } else {
        const data = await res.json();
        setSubmitError(data.message || "Registration failed. Please try again.");
      }
    } catch {
      setSubmitError("Registration failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Fill in the details below to register</CardDescription>
          <CardAction>
            <Link href="/">
              <Button variant="link">Login</Button>
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-6 mb-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  aria-invalid={!!formErrors.name}
                  aria-describedby={formErrors.name ? "name-error" : undefined}
                  className={formErrors.name ? "border-red-600" : ""}
                />
                {formErrors.name && (
                  <p id="name-error" className="text-sm text-red-600 mt-1">
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  aria-invalid={!!formErrors.email}
                  aria-describedby={formErrors.email ? "email-error" : undefined}
                  className={formErrors.email ? "border-red-600" : ""}
                />
                {formErrors.email && (
                  <p id="email-error" className="text-sm text-red-600 mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="grid gap-2 relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  aria-invalid={!!formErrors.password}
                  aria-describedby={formErrors.password ? "password-error" : undefined}
                  className={formErrors.password ? "border-red-600" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[30px] text-sm text-gray-500 hover:text-gray-700 focus:outline-none select-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-auto"/> : <Eye className="w-5 h-auto"/>}
                </button>
                {formErrors.password && (
                  <p id="password-error" className="text-sm text-red-600 mt-1">
                    {formErrors.password}
                  </p>
                )}
              </div>
            </div>

            {submitError && (
              <p className="mb-4 text-sm text-red-600">{submitError}</p>
            )}

            <Button type="submit" className="w-full flex items-center justify-center" disabled={loading}>
              {loading && <Spinner />}
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center flex flex-col justify-center">
          <small className="font-semibold flex items-center gap-2">
            <Image src="/logo.png" width={24} height={24} alt="Logo" priority />
            JEM CDYN, Dev.
          </small>
          <a
            href="https://jemcdyn.vercel.app/"
            target="_blank"
            className="text-[12px]"
            rel="noreferrer"
          >
            https://jemcdyn.vercel.app/
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { signInSchema } from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pageVariants } from "@/lib/animations";
import type { z } from "zod";
import { useState } from "react";

type FormValues = z.infer<typeof signInSchema> & { remember?: boolean };

export default function SignInPage() {
  const { signin } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { remember: true },
  });

  const remember = watch("remember");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      await signin({
        identifier: values.identifier,
        password: values.password,
      });
      if (!values.remember && typeof window !== "undefined") {
        // still keep token for session; "remember" is a UX hint only here
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <Card className="glass border-border/70 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to continue to your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or username</Label>
              <Input id="identifier" autoComplete="username" {...register("identifier")} />
              {errors.identifier ? (
                <p className="text-sm text-destructive">{errors.identifier.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
              {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(v) => setValue("remember", v === true)}
              />
              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                Remember me
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { changePasswordSchema, deleteAccountSchema, updateProfileSchema } from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";
import { userAPI } from "@/lib/api";
import { pageVariants } from "@/lib/animations";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { z } from "zod";

type ProfileForm = z.infer<typeof updateProfileSchema>;
type PasswordForm = z.infer<typeof changePasswordSchema>;
type DeleteForm = z.infer<typeof deleteAccountSchema>;

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const [theme, setTheme] = useLocalStorage<"dark" | "light">("cortexly-theme", "dark");
  const [emailNotif, setEmailNotif] = useState(true);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
      body.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
      body.classList.remove("light");
    }
  }, [theme]);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      fullName: user?.fullName ?? "",
      username: user?.username ?? "",
      bio: user?.bio ?? "",
      avatar: user?.avatar ?? "",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const deleteForm = useForm<DeleteForm>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { password: "" },
  });

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Account</p>
        <h2 className="text-3xl font-semibold tracking-tight">Settings</h2>
        <p className="mt-2 text-muted-foreground">Update your profile, security, and preferences.</p>
      </div>

      <Card className="glass border-border/60">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Avatar URL, display name, and bio.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={profileForm.handleSubmit(async (values) => {
              try {
                await userAPI.updateProfile({
                  fullName: values.fullName,
                  username: values.username,
                  bio: values.bio,
                  avatar: values.avatar || undefined,
                });
                toast.success("Profile updated");
                await refreshUser();
              } catch (error: unknown) {
                const message =
                  error && typeof error === "object" && "response" in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
                toast.error(message || "Update failed");
              }
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input id="avatar" placeholder="https://..." {...profileForm.register("avatar")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" {...profileForm.register("fullName")} />
              {profileForm.formState.errors.fullName ? (
                <p className="text-sm text-destructive">{profileForm.formState.errors.fullName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...profileForm.register("username")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={4} {...profileForm.register("bio")} />
            </div>
            <Button type="submit" disabled={profileForm.formState.isSubmitting}>
              {profileForm.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass border-border/60">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Update your password regularly.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={passwordForm.handleSubmit(async (values) => {
              try {
                await userAPI.changePassword(values);
                toast.success("Password updated");
                passwordForm.reset();
              } catch (error: unknown) {
                const message =
                  error && typeof error === "object" && "response" in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
                toast.error(message || "Could not change password");
              }
            })}
          >
            <div className="space-y-2">
              <Label>Current password</Label>
              <Input type="password" {...passwordForm.register("currentPassword")} />
            </div>
            <div className="space-y-2">
              <Label>New password</Label>
              <Input type="password" {...passwordForm.register("newPassword")} />
            </div>
            <div className="space-y-2">
              <Label>Confirm password</Label>
              <Input type="password" {...passwordForm.register("confirmPassword")} />
            </div>
            <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
              {passwordForm.formState.isSubmitting ? "Updating..." : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass border-border/60">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Control how Cortexly feels day-to-day.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Switch between dark and light surfaces.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Dark</span>
              <Switch checked={theme === "light"} onCheckedChange={(v) => setTheme(v ? "light" : "dark")} />
              <span>Light</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="notif"
              checked={emailNotif}
              onCheckedChange={(v) => setEmailNotif(v === true)}
            />
            <Label htmlFor="notif" className="text-sm font-normal text-muted-foreground">
              Email notifications for product updates
            </Label>
          </div>
          <div className="space-y-2">
            <Label>Language</Label>
            <select
              className="h-10 w-full rounded-md border border-border bg-card/60 px-3 text-sm"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>Deleting your account removes all associated content.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action is permanent. Confirm with your password to proceed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <form
                className="space-y-3"
                onSubmit={deleteForm.handleSubmit(async (values) => {
                  try {
                    await userAPI.deleteAccount(values);
                    toast.success("Account deleted");
                    logout();
                  } catch (error: unknown) {
                    const message =
                      error && typeof error === "object" && "response" in error
                        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                        : undefined;
                    toast.error(message || "Could not delete account");
                  }
                })}
              >
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" {...deleteForm.register("password")} />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                  <Button type="submit" variant="destructive">
                    Delete forever
                  </Button>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </motion.div>
  );
}

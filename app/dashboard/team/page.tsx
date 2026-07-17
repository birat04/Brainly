"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { teamAPI } from "@/lib/api";
import { pageVariants } from "@/lib/animations";
import { useAuth } from "@/hooks/useAuth";
import { copyToClipboard } from "@/lib/utils";
import type { WorkspaceInvite, WorkspaceMember } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");
  const [busy, setBusy] = useState(false);

  const canManage = role === "owner" || role === "admin";

  const load = useCallback(async () => {
    try {
      const data = await teamAPI.list();
      setMembers(data.members);
      setInvites(data.invites);
      setRole(data.role);
    } catch {
      toast.error("Could not load team");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sendInvite = async () => {
    if (!email.trim()) return;
    setBusy(true);
    try {
      const result = await teamAPI.invite(email.trim(), inviteRole);
      toast.success(
        result.emailSent
          ? "Invite email sent"
          : "Invite created (email not configured — copy the link)",
      );
      if (!result.emailSent && result.inviteUrl) {
        await copyToClipboard(result.inviteUrl);
        toast.message("Invite link copied to clipboard");
      }
      setEmail("");
      await load();
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || "Invite failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Workspace</p>
        <h2 className="text-3xl font-semibold tracking-tight">Team</h2>
        <p className="mt-2 text-muted-foreground">
          Invite collaborators and manage who can access this workspace.
        </p>
      </div>

      {canManage ? (
        <Card className="glass border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite member
            </CardTitle>
            <CardDescription>
              They must sign in with the invited email to accept.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2 md:w-40">
              <Label>Role</Label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as "member" | "admin")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => void sendInvite()} disabled={busy || !email.trim()}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send invite
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="glass border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
          ) : (
            members.map((m) => (
              <div
                key={m.userId}
                className="flex flex-col gap-2 rounded-lg border border-border/50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {m.fullName}{" "}
                    <span className="text-sm font-normal text-muted-foreground">@{m.username}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {m.email} · {m.role}
                  </p>
                </div>
                {canManage && m.role !== "owner" && m.userId !== user?.id ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await teamAPI.removeMember(m.userId);
                        toast.success("Member removed");
                        await load();
                      } catch {
                        toast.error("Could not remove member");
                      }
                    }}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {canManage && invites.length > 0 ? (
        <Card className="glass border-border/60">
          <CardHeader>
            <CardTitle>Pending invites</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-col gap-2 rounded-lg border border-border/50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{inv.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {inv.role} · expires {new Date(inv.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await copyToClipboard(inv.inviteUrl);
                      toast.success("Link copied");
                    }}
                  >
                    Copy link
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={async () => {
                      try {
                        await teamAPI.revokeInvite(inv.id);
                        toast.success("Invite revoked");
                        await load();
                      } catch {
                        toast.error("Could not revoke invite");
                      }
                    }}
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </motion.div>
  );
}

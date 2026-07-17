"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { teamAPI, workspacesAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { setAuthToken } from "@/lib/utils";
import { Navbar } from "@/components/marketing/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function AcceptInvitePage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [invite, setInvite] = useState<{
    email: string;
    role: string;
    workspaceName: string;
    expiresAt: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await teamAPI.getInvite(token);
        setInvite(data);
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
        setError(message || "Invite not found or expired");
      }
    };
    void run();
  }, [token]);

  const accept = async () => {
    setBusy(true);
    try {
      const result = await teamAPI.acceptInvite(token);
      try {
        const switched = await workspacesAPI.switch(result.workspaceId);
        setAuthToken(switched.token);
      } catch {
        /* switch optional if already active */
      }
      toast.success(`Joined ${result.workspaceName}`);
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || "Could not accept invite");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto flex max-w-lg flex-col px-4 py-16">
        <Card className="glass border-border/60">
          <CardHeader>
            <CardTitle>Workspace invite</CardTitle>
            <CardDescription>
              {error
                ? error
                : invite
                  ? `You've been invited to ${invite.workspaceName}`
                  : "Loading invite…"}
            </CardDescription>
          </CardHeader>
          {invite && !error ? (
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Role: <span className="text-foreground">{invite.role}</span>
              </p>
              <p>
                Invited email: <span className="text-foreground">{invite.email}</span>
              </p>
              <p>Expires {new Date(invite.expiresAt).toLocaleString()}</p>
              {isAuthenticated && user?.email?.toLowerCase() !== invite.email.toLowerCase() ? (
                <p className="text-destructive">
                  You are signed in as {user?.email}. Sign in as {invite.email} to accept.
                </p>
              ) : null}
            </CardContent>
          ) : null}
          <CardFooter className="flex flex-wrap gap-2">
            {error ? (
              <Button asChild>
                <Link href="/">Back home</Link>
              </Button>
            ) : authLoading || !invite ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading
              </Button>
            ) : !isAuthenticated ? (
              <>
                <Button asChild>
                  <Link href={`/signin?next=/invite/${token}`}>Sign in to accept</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/signup?email=${encodeURIComponent(invite.email)}&next=/invite/${token}`}>
                    Create account
                  </Link>
                </Button>
              </>
            ) : (
              <Button
                onClick={() => void accept()}
                disabled={
                  busy || user?.email?.toLowerCase() !== invite.email.toLowerCase()
                }
              >
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Accept invite
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

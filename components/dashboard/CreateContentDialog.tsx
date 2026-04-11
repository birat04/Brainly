"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { createContentSchema } from "@/lib/validations";
import { useContent } from "@/hooks/useContent";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { z } from "zod";

const contentTypes = [
  { value: "article", label: "Article" },
  { value: "link", label: "Link" },
  { value: "note", label: "Note" },
  { value: "video", label: "Video" },
  { value: "image", label: "Image" },
];

type FormValues = z.infer<typeof createContentSchema>;

export function CreateContentDialog() {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const { createContent } = useContent();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(createContentSchema),
    defaultValues: {
      type: "note",
      tags: [],
      title: "",
      description: "",
      url: "",
      body: "",
    },
  });

  const contentType = watch("type");

  const onSubmit = async (data: FormValues) => {
    try {
      await createContent({
        title: data.title,
        description: data.description,
        type: data.type,
        tags,
        url: data.url || undefined,
        body: data.body || undefined,
      });
      setOpen(false);
      reset();
      setTags([]);
      setTagInput("");
    } catch {
      /* toast in hook */
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((x) => x !== tag));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="gap-2" data-create-trigger>
          <Plus className="h-4 w-4" />
          Create Content
        </Button>
      </DialogTrigger>
      <DialogContent className="glass max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Content</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" placeholder="Enter content title" {...register("title")} />
            {errors.title ? <p className="text-sm text-destructive">{errors.title.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Type *</Label>
            <Select
              value={contentType}
              onValueChange={(value) => setValue("type", value as FormValues["type"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type ? <p className="text-sm text-destructive">{errors.type.message}</p> : null}
          </div>

          {["link", "video", "image"].includes(contentType) ? (
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input id="url" placeholder="https://example.com" {...register("url")} />
              {errors.url ? <p className="text-sm text-destructive">{errors.url.message}</p> : null}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Add a description..." rows={3} {...register("description")} />
          </div>

          {["article", "note"].includes(contentType) ? (
            <div className="space-y-2">
              <Label htmlFor="body">Content</Label>
              <Textarea id="body" placeholder="Write your content here..." rows={6} {...register("body")} />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag} variant="secondary">
                Add
              </Button>
            </div>
            {tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-sm text-primary"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Content"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

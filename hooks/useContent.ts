import { useState, useCallback, useEffect } from 'react';
import { contentAPI } from '@/lib/api';
import { Content } from '@/types';
import { toast } from 'sonner';

export function useContent() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await contentAPI.getAll();
      setContent(response.data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch content';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createContent = useCallback(
    async (data: { title: string; type: string; link?: string }) => {
      try {
        const response = await contentAPI.create(data);
        setContent(prev => [response.data, ...prev]);
        toast.success('Content created successfully!');
        return response.data;
      } catch (err: any) {
        const message = err.response?.data?.message || 'Failed to create content';
        toast.error(message);
        throw err;
      }
    },
    []
  );

  const deleteContent = useCallback(async (id: string) => {
    try {
      await contentAPI.delete(id);
      setContent(prev => prev.filter(item => item.id !== id));
      toast.success('Content deleted successfully!');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete content';
      toast.error(message);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return {
    content,
    loading,
    error,
    fetchContent,
    createContent,
    deleteContent,
  };
}

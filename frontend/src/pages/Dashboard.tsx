
import '../App.css';
import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CreateContentModal } from '../components/CreateContentModel';
import { PlusIcon } from '../icons/PlusIcon';
import { ShareIcon } from '../icons/ShareIcon';
import { SideBar } from '../components/SideBar';
import { BackendURL } from '../config';
import { toast, ToastContainer } from 'react-toastify';

type ContentItem = {
  id: string;
  title: string;
  link: string;
  type: 'video' | 'article' | 'image';
};

type BackendContentItem = {
  _id?: string;
  id?: string;
  title: string;
  link: string;
  type: 'video' | 'article' | 'image';
};

export function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [cards, setCards] = useState<
    ContentItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BackendURL}/api/v1/content`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch content');
        const data = await res.json();
        
        setCards(
          data.content.map((item: BackendContentItem) => ({
            id: item._id || item.id || '',
            title: item.title,
            link: item.link,
            type: item.type,
          }))
        );
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error fetching content');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleCreate = async (newContent: {
    title: string;
    link: string;
    type: 'video' | 'article' | 'image';
  }) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BackendURL}/api/v1/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newContent),
      });
      if (!res.ok) throw new Error('Failed to create content');
      toast.success('Content created!');
      
      setShowModal(false);
     
      setLoading(true);
      const refetch = await fetch(`${BackendURL}/api/v1/content`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const refetchData = await refetch.json();
      setCards(
        refetchData.content.map((item: BackendContentItem) => ({
          id: item._id || item.id,
          title: item.title,
          link: item.link,
          type: item.type,
        }))
      );
      setLoading(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Error creating content');
      } else {
        toast.error('Error creating content');
      }
    }
  };

 
  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BackendURL}/api/v1/content`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contentId: id }),
      });
      if (!res.ok) throw new Error('Failed to delete content');
      toast.success('Content deleted!');
      setCards((prev) => prev.filter((card) => card.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Error deleting content');
      } else {
        toast.error('Error deleting content');
      }
    }
  };

  const handleShare = () => {
    if (cards.length === 0) return;
    const lastLink = cards[cards.length - 1].link;
    navigator.clipboard.writeText(lastLink);
    toast.info(`Link copied to clipboard: ${lastLink}`);
  };

  return (
    <div className="flex">
      <ToastContainer />
      {/* Sidebar */}
      <SideBar />

      {/* Main content */}
      <main className="flex-1 pl-64 p-6 bg-gray-50 overflow-auto space-y-4">
        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            variant="primary"
            startIcon={<PlusIcon />}
            size="md"
            title="Add Content"
            onClick={() => setShowModal(true)}
          />
          <Button
            variant="secondary"
            startIcon={<ShareIcon />}
            size="md"
            title="Share Content"
            onClick={handleShare}
          />
        </div>

        {/* Loading/Error/Empty State */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : cards.length === 0 ? (
          <div className="text-center py-8">No content yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {cards.map((card) => (
              <Card
                key={card.id}
                title={card.title}
                link={card.link}
                type={card.type}
                onDelete={() => handleDelete(card.id)}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <CreateContentModal
            open={showModal}
            onClose={() => setShowModal(false)}
            onCreate={handleCreate}
          />
        )}
      </main>
    </div>
  );
}



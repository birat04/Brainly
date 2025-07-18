
import '../App.css';
import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CreateContentModal } from '../components/CreateContentModel';
import { PlusIcon } from '../icons/PlusIcon';
import { ShareIcon } from '../icons/ShareIcon';
import { SideBar } from '../components/SideBar';

export function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [cards, setCards] = useState<
    { title: string; link: string; type: 'video' | 'article' | 'image' }[]
  >([
    {
      type: 'video',
      title: 'YouTube: DSA in Java',
      link: 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
    },
    {
      type: 'video',
      title: 'Vimeo: The Power of Time Off',
      link: 'https://vimeo.com/76979871',
    },
    {
      type: 'video',
      title: 'TED Talk: Year of Yes',
      link: 'https://www.ted.com/talks/shonda_rhimes_my_year_of_saying_yes_to_everything',
    },
  ]);

  const handleCreate = (newContent: {
    title: string;
    link: string;
    type: 'video' | 'article' | 'image';
  }) => {
    setCards((prev) => [...prev, newContent]);
  };

  const handleDelete = (index: number) => {
    setCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleShare = () => {
    if (cards.length === 0) return;
    const lastLink = cards[cards.length - 1].link;
    navigator.clipboard.writeText(lastLink);
    alert(`Link copied to clipboard:\n${lastLink}`);
  };

  return (
    <div className="flex">
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

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {cards.map((card, index) => (
            <Card
              key={index}
              title={card.title}
              link={card.link}
              type={card.type}
              onDelete={() => handleDelete(index)}
            />
          ))}
        </div>

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



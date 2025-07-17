import './App.css';
import { useState } from 'react';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { CreateContentModal } from './components/CreateContentModel';
import { PlusIcon } from './icons/PlusIcon';
import { ShareIcon } from './icons/ShareIcon';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [cards, setCards] = useState<{ title: string; link: string; type: 'video' | 'article' | 'image' }[]>([

    {
      type: 'video' as const,
      title: 'YouTube: DSA in Java',
      link: 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
    },
    {
      type: 'video' as const,
      title: 'Vimeo: The Power of Time Off',
      link: 'https://vimeo.com/76979871',
    },
    {
      type: 'video' as const,
      title: 'TED Talk: Year of Yes',
      link: 'https://www.ted.com/talks/shonda_rhimes_my_year_of_saying_yes_to_everything',
    },
  ]);

 const handleDelete = (index: number) => {
  setCards(prev => prev.filter((_, i) => i !== index));
  };

  {cards.map((card, index) => (
  <Card
    key={index}
    title={card.title}
    link={card.link}
    type={card.type}
    onDelete={() => handleDelete(index)}
  />
))}



  const handleCreate = (newContent: { title: string; link: string; type: 'video' | 'article' | 'image' }) => {
    setCards((prev) => [...prev, newContent]);
  };

  const handleShare = () => {
    if (cards.length === 0) return;
    const lastLink = cards[cards.length - 1].link;
    navigator.clipboard.writeText(lastLink);
    alert(`Link copied to clipboard:\n${lastLink}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Buttons Top Right */}
      <div className="flex justify-end gap-4">
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

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <Card key={index} {...card} />
        ))}
      </div>

      {/* Create Content Modal */}
      {showModal && (
        <CreateContentModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

export default App;

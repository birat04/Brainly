import { Button } from './components/Button';
import { PlusIcon } from './icons/plusIcon';
import { ShareIcon } from './icons/ShareIcon';

function App() {
  return (
    <div className="relative min-h-screen ">
      <div className="space-x-4 p-4 flex absolute top-1 right-1 gap-4 items-center">
        <Button startIcon={<ShareIcon size="md" />} variant="secondary" size="md" text="Add Content"/>
        <Button startIcon={<PlusIcon size="md" />} variant="primary" size="md" text="Share"/>

      </div>
    </div>

  );
}

export default App;

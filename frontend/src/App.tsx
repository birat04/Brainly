import { Button } from './components/Button';
import { PlusIcon } from './icons/plusIcon';
import { ShareIcon } from './icons/ShareIcon';

function App() {
  return (
    <div className="space-x-4 p-4">
      <Button startIcon={<PlusIcon />} variant="primary" size="md" text="Share"/>
      <Button startIcon={<ShareIcon />} variant="secondary" size="md" text="Add Content"/>
     
    </div>
  );
}

export default App;

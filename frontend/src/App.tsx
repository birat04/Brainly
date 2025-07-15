import './App.css'
import { Button } from './components/Button'
import { Card } from './components/Card'
import { PlusIcon } from './icons/PlusIcon'
import { ShareIcon } from './icons/ShareIcon'

function App() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <div className="flex gap-4">
        <Button variant="primary" startIcon={<PlusIcon />} size="md" title="Add Content" />
        <Button variant="secondary" startIcon={<ShareIcon />} size="md" title="Share Content" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card
          type="video"
          title="YouTube: DSA in Java"
          link="https://www.youtube.com/watch?v=RBSGKlAvoiM"
        />
        <Card
          type="video"
          title="Vimeo: The Power of Time Off"
          link="https://vimeo.com/76979871"
        />
        <Card
          type="video"
          title="TED Talk: Year of Yes"
          link="https://www.ted.com/talks/shonda_rhimes_my_year_of_saying_yes_to_everything"
        />
       
      </div>
    </div>
  )
}

export default App

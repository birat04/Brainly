import './App.css'
import { Button } from './components/Button'
import { Card } from './components/Card'
import { PlusIcon } from './icons/PlusIcon'
import { ShareIcon } from './icons/ShareIcon'


function App() {

  return <div>
    <Button variant={"primary"} startIcon={<PlusIcon />} size="md" title={"Add Content"}></Button>
    <Button variant={"secondary"} startIcon={<ShareIcon />} size="md" title={"Share Content"}></Button>

    <Card type={"video"} title={"DSA in Java"} link={"https://www.youtube.com/watch?v=RBSGKlAvoiM"} />
  </div>
}

export default App
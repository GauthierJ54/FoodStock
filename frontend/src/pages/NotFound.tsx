import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

function NotFound() {
  return (
    <div className="space-y-4 text-center">
      <h2 className="text-2xl font-bold">Page introuvable</h2>

      <p className="text-muted-foreground">
        La page demandée n’existe pas.
      </p>

      <Button asChild>
        <Link to="/">Retour au settings</Link>
      </Button>
    </div>
  )
}

export default NotFound
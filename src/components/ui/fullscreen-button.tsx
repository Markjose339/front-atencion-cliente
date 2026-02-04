import { Maximize, Minimize } from "lucide-react"
import { Button } from "./button"
import { useState } from "react"

export function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleFullscreen}
      className="absolute left-6 top-6 h-14 w-14"
    >
      {isFullscreen ? (
        <Minimize className="h-7 w-7" />
      ) : (
        <Maximize className="h-7 w-7" />
      )}
    </Button>
  )
}
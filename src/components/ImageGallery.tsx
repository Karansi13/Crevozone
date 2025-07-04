import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "./ui/Button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface Media {
  id: string
  type: "image" | "video"
  url: string
}

interface ImageGalleryProps {
  media: Media[]
}

export function ImageGallery({ media }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setIsOpen(true)
  }

  const closeLightbox = () => {
    setIsOpen(false)
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? media.length - 1 : prevIndex - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === media.length - 1 ? 0 : prevIndex + 1))
  }

  if (media.length === 0) return null

  return (
    <>
      <div className="relative w-full max-h-[500px] overflow-hidden">
        <div className={`grid ${media.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-[2px]`}>
          {media.slice(0, 3).map((item, index) => {
            const isFirstWithThree = index === 0 && media.length === 3
            const isSingleImage = media.length === 1

            return (
              <div
                key={item.id}
                className={`relative cursor-pointer ${
                  isFirstWithThree || isSingleImage ? "col-span-2" : ""
                } ${isSingleImage ? "aspect-[4/3]" : "aspect-square"}`}
                onClick={() => openLightbox(index)}
              >
                {item.type === "image" ? (
                  <img
                    src={item.url || "/placeholder.svg"}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : (
                  <video src={item.url} className="absolute inset-0 w-full h-full object-contain" />
                )}
                {index === 2 && media.length > 3 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-2xl font-semibold">+{media.length - 3}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh] flex items-center justify-center  border-none">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/20 border-none"
            onClick={closeLightbox}
          >
            <X className="h-8 w-8" />
          </Button>
          {media.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={goToNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
          <div className="relative w-full h-full flex items-center justify-center">
            {media[currentIndex].type === "image" ? (
              <img
                src={media[currentIndex].url || "/placeholder.svg"}
                alt=""
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <video src={media[currentIndex].url} controls className="max-h-full max-w-full object-contain" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


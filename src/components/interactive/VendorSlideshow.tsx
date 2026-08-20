import { useEffect, useState } from "react";

interface Photo {
  src: string;
  alt: string;
}

/** Auto-advancing photo block with dot indicators (vendors section). */
export default function VendorSlideshow({ photos }: { photos: Photo[]; }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setActive((i) => (i + 1) % photos.length),
      5000,
    );
    return () => clearInterval(id);
  }, [photos.length]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-blob">
      {photos.map((photo, i) => (
        <img
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          aria-hidden={i !== active}
          className={"absolute inset-0 size-full object-cover transition-opacity duration-700 "
            + (i === active ? "opacity-100" : "opacity-0")}
        />
      ))}
      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Wys foto ${i + 1}`}
            aria-current={i === active}
            className={"size-3 cursor-pointer rounded-full transition-colors "
              + (i === active ? "bg-white" : "bg-white/60")}
          />
        ))}
      </div>
    </div>
  );
}

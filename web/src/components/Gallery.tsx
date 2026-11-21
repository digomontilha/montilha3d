"use client";

import Image from "next/image";
import { useState } from "react";

// Foto principal + miniaturas (botões). Com uma foto só, não mostra miniaturas.
export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [i, setI] = useState(0);
  const alt = (k: number) => `Foto ${k + 1} de ${images.length}: ${name}`;
  if (!images.length) return <div className="aspect-square rounded-md bg-surface" />;
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-md bg-surface">
        <Image key={images[i]} src={images[i]} alt={alt(i)} fill preload={i === 0} sizes="(min-width:768px) 55vw, 100vw" className="object-contain" />
      </div>
      {images.length > 1 && (
        <ul aria-label="Fotos do produto" className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((src, k) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setI(k)}
                aria-label={`Mostrar foto ${k + 1} de ${images.length}`}
                aria-pressed={k === i}
                className="relative block aspect-square w-full overflow-hidden rounded bg-surface outline-offset-2 ring-brand aria-pressed:ring-2"
              >
                <Image src={src} alt="" fill sizes="120px" className="object-contain" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

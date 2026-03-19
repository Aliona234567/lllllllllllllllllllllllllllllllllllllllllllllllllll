import NextImage from "next/image";

export function Image({ src }: { src: string }) {
  return (
    <NextImage
      className="w-full h-full object-cover"
      alt=""
      width={1920}
      height={1080}
      src={`/api/file/${src}`}
    />
  );
}
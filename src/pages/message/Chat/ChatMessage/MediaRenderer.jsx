import { FaFile, FaPlayCircle } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";

const MediaWrapper = ({ children, uploading }) => (
  <div className="relative group">
    {children}

    {uploading && (
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )}
  </div>
);

export default function MediaRenderer({ media, onPreview }) {
  if (media.type === "image") {
    return (
      <MediaWrapper uploading={media.status === "uploading"}>
        <img
          src={media.url}
          alt="attachment"
          onClick={() => onPreview(media)}
          className="
          cursor-pointer
          rounded-xl
          object-cover
          w-full
          max-w-[220px]
          sm:max-w-[260px]
          md:max-w-[320px]
          aspect-[4/3]
          hover:opacity-90
          transition
        "
        />
      </MediaWrapper>
    );
  }
  if (media.type === "video") {
    return (
      <MediaWrapper uploading={media.status === "uploading"}>
        <div
          onClick={() => onPreview(media)}
          className="
          relative
          cursor-pointer
          rounded-xl
          overflow-hidden
          w-full
          max-w-[240px]
          sm:max-w-[280px]
          md:max-w-[350px]
          aspect-video
        "
        >
          <video
            src={media.url}
            muted
            className="w-full h-full object-cover pointer-events-none"
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition">
            <FaPlayCircle className="text-white text-4xl opacity-80" />
          </div>
        </div>
      </MediaWrapper>
    );
  }
  if (media.type === "raw" || media.type === "file") {
    return (
      <MediaWrapper uploading={media.status === "uploading"}>
        <a
          href={media.url}
          target="_blank"
          rel="noopener noreferrer"
          className="
          flex items-center gap-3
          px-4 py-3
          bg-gray-800
          hover:bg-gray-700
          rounded-xl
          w-full
          max-w-[260px]
          transition
        "
        >
          <FaFile className="text-lg text-gray-400 shrink-0" />

          <span className="flex-1 text-sm text-gray-200 truncate">
            {media.fileName}
          </span>

          <FiDownload className="text-gray-400 shrink-0" />
        </a>
      </MediaWrapper>
    );
  }

  return null;
}

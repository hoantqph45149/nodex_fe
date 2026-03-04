import { FaFile, FaPlayCircle } from "react-icons/fa";

export default function FilePreview({ file, index, removeFile }) {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  return (
    <div
      className={`
    relative
    rounded-lg
    overflow-hidden
    bg-gray-700
    flex items-center justify-center
    transition
    ${
      isImage || isVideo
        ? "w-14 h-14 sm:w-16 sm:h-16"
        : "max-w-[160px] h-14 sm:h-16 px-2"
    }
  `}
    >
      {/* IMAGE */}
      {isImage && (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      )}

      {/* VIDEO */}
      {isVideo && (
        <>
          <video
            src={URL.createObjectURL(file)}
            className="w-full h-full object-cover"
            muted
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <FaPlayCircle className="text-white text-2xl sm:text-3xl drop-shadow" />
          </div>
        </>
      )}

      {/* FILE */}
      {!isImage && !isVideo && (
        <div className="w-full h-full flex items-center gap-2 text-white text-xs">
          <div className="w-7 h-7 flex items-center justify-center bg-gray-600 rounded-md shrink-0">
            <FaFile className="text-sm" />
          </div>

          <span
            className="flex-1 truncate text-[11px] leading-tight"
            title={file.name}
          >
            {file.name}
          </span>
        </div>
      )}

      {/* REMOVE BUTTON */}
      <button
        onClick={() => removeFile(index)}
        className="
      absolute
      -top-2 -right-2
      w-6 h-6
      rounded-full
      bg-black/70
      backdrop-blur
      text-white
      text-xs
      flex items-center justify-center
      hover:bg-red-500
      transition
    "
      >
        ✕
      </button>
    </div>
  );
}

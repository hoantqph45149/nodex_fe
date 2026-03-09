import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../../services/fetchInstance";
import { useAuthContext } from "../../contexts/AuthContext";

const CreatePost = () => {
  const queryClient = useQueryClient();

  const { authUser } = useAuthContext();
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const imgRef = useRef(null);

  const {
    mutate: createPost,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ text, img }) => {
      try {
        const res = await fetchWithAuth("/api/posts/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, img }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      setText("");
      setImg(null);
      toast.success("Post created successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createPost({ text, img });
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex p-3 sm:p-4 items-start gap-3 sm:gap-4 border-b border-gray-700">
      {/* Avatar */}
      <div className="avatar flex-shrink-0">
        <div className="w-8 sm:w-9 rounded-full">
          <img src={authUser?.profileImg || "/avatar-placeholder.png"} />
        </div>
      </div>

      <form
        className="flex flex-col gap-2 w-full min-w-0"
        onSubmit={handleSubmit}
      >
        {/* Textarea */}
        <textarea
          className="w-full p-0 text-base sm:text-lg resize-none border-none focus:outline-none bg-transparent"
          placeholder="What is happening?!"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Image preview */}
        {img && (
          <div className="relative w-full max-w-md mx-auto">
            <IoCloseSharp
              className="absolute top-2 right-2 text-white bg-gray-800 rounded-full w-6 h-6 p-1 cursor-pointer"
              onClick={() => {
                setImg(null);
                imgRef.current.value = null;
              }}
            />

            <img
              src={img}
              className="w-full max-h-80 object-contain rounded-lg"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-gray-700 pt-2">
          <div className="flex gap-2 items-center">
            <CiImageOn
              className="fill-primary w-5 h-5 sm:w-6 sm:h-6 cursor-pointer"
              onClick={() => imgRef.current.click()}
            />
            <BsEmojiSmileFill className="fill-primary w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
          </div>

          <input
            type="file"
            accept="image/*"
            hidden
            ref={imgRef}
            onChange={handleImgChange}
          />

          <button className="btn btn-primary rounded-full btn-sm text-white px-4 sm:px-5">
            {isPending ? "Posting..." : "Post"}
          </button>
        </div>

        {isError && <div className="text-red-500 text-sm">{error.message}</div>}
      </form>
    </div>
  );
};
export default CreatePost;

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { MdPassword } from "react-icons/md";
import { Link, useSearchParams } from "react-router-dom";
import NodexSvg from "../../../components/svgs/Nodex";
import { fetchWithAuth } from "../../../services/fetchInstance";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("tk");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const {
    mutate: resetPasswordMutation,
    isPending,
    isError,
    isSuccess,
    error,
  } = useMutation({
    mutationFn: async ({ password }) => {
      const res = await fetchWithAuth(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      return data;
    },
    onSuccess: () => {
      toast.success(
        "Password reset successful! You can now log in with your new password.",
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return alert("Passwords do not match");
    }

    resetPasswordMutation({ password: formData.password });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen">
      {/* left */}
      <div className="flex-1 hidden lg:flex items-center justify-center">
        <NodexSvg className="lg:w-2/3 fill-white" />
      </div>

      {/* right */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <form className="flex gap-4 flex-col" onSubmit={handleSubmit}>
          <NodexSvg className="w-24 lg:hidden fill-white" />

          <h1 className="text-4xl font-extrabold text-white">
            Create new password
          </h1>

          <p className="text-gray-400 text-sm max-w-sm">
            Enter your new password below.
          </p>

          {/* password */}
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />

            <input
              type={showPassword ? "text" : "password"}
              className="grow"
              placeholder="New password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="cursor-pointer"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </label>

          {/* confirm password */}
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />

            <input
              type="password"
              className="grow"
              placeholder="Confirm password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </label>

          <button className="btn rounded-full btn-primary text-white">
            {isPending ? "Resetting..." : "Reset password"}
          </button>

          {isError && <p className="text-red-500 text-sm">{error.message}</p>}
        </form>

        <div className="mt-6">
          <Link to="/login">
            <button className="btn rounded-full btn-primary text-white btn-outline w-full">
              Back to login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

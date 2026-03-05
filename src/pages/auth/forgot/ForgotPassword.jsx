import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { MdOutlineMail } from "react-icons/md";
import { Link } from "react-router-dom";
import NodexSvg from "../../../components/svgs/Nodex";
import { fetchWithAuth } from "../../../services/fetchInstance";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(0);

  const {
    mutate: forgotPasswordMutation,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async (email) => {
      const res = await fetchWithAuth("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      console.log(res);
      console.log(res.ok);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? (data.message || "Something went wrong"));
      }

      return data;
    },
    onSuccess: () => {
      setCountdown(15);
      toast.success("Check your email for the reset link.");
    },
  });

  useEffect(() => {
    if (countdown === 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (countdown > 0) return;
    forgotPasswordMutation(email);
  };

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen">
      <div className="flex-1 hidden lg:flex items-center justify-center">
        <NodexSvg className="lg:w-2/3 fill-white" />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        <form className="flex gap-4 flex-col" onSubmit={handleSubmit}>
          <NodexSvg className="w-24 lg:hidden fill-white" />

          <h1 className="text-4xl font-extrabold text-white">Reset password</h1>

          <p className="text-gray-400 text-sm max-w-sm">
            Enter your email and we'll send you a link to reset your password.
          </p>

          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="email"
              className="grow"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <button
            disabled={countdown > 0 || isPending}
            className="btn rounded-full btn-primary text-white"
          >
            {isPending
              ? "Sending..."
              : countdown > 0
                ? `Resend in ${countdown}s`
                : "Send reset link"}
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

export default ForgotPassword;

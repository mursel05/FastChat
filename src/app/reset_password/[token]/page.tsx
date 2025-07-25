"use client";
import PasswordShow from "@/components/PasswordShow";
import axiosInstance from "@/utils/axios";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const ResetPassword = () => {
  const params = useParams();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showShowPassword, setShowShowPassword] = useState<string>("invisible");
  const [passwordType, setPasswordType] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("invisible");
  const router = useRouter();

  function changeShowPassword(par: boolean) {
    setShowPassword(par);
    setPasswordType(!passwordType);
  }

  useEffect(() => {
    if (password) setShowShowPassword("");
    else setShowShowPassword("invisible");
  }, [password]);

  async function resetPassword() {
    try {
      const res = await axiosInstance.post("/users/reset-password", {
        token: params.token,
        password: password,
      });
      if (res.data.success) {
        Swal.getConfirmButton()?.addEventListener("click", () => {
          router.push("/login");
        });
      }
    } catch (error) {}
  }

  function handleForm(e: React.ChangeEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (password.length < 6) {
      setPasswordError("visible");
      return;
    } else setPasswordError("invisible");
    resetPassword();
  }

  return (
    <div className="btn-blue-pink h-[100vh] flex flex-col items-center justify-center">
      <form
        onSubmit={handleForm}
        className="bg-white border rounded-lg flex items-center flex-col  w-[25rem] p-7 ">
        <div className="flex flex-col items-center gap-5">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="light-gray text-xs font-medium">Password</label>
              <div className="flex flex-col">
                <div className="flex gap-2 border-b-2 pb-1 items-center">
                  <Image
                    src="/icons/password.png"
                    width={24}
                    height={24}
                    alt="password"
                    className="w-6 h-6"
                  />
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    size={25}
                    className="login-input mb-1 text-black"
                    type={passwordType ? "text" : "password"}
                    placeholder="Type your password"
                  />
                  <PasswordShow
                    showShowPassword={showShowPassword}
                    showPassword={showPassword}
                    changeShowPassword={changeShowPassword}
                  />
                </div>
                <div className="flex items-center justify-between ">
                  <span className={`dark-red text-xs ${passwordError}`}>
                    Password must be at least 6 characters
                  </span>
                </div>
              </div>
            </div>
            <button className="btn-blue-pink py-2 rounded-full text-white text-xs font-medium">
              Reset Password
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;

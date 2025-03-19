"use client";
import PasswordShow from "@/components/PasswordShow";
import axiosInstance from "@/utils/axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showShowPassword, setShowShowPassword] = useState<string>("invisible");
  const [passwordType, setPasswordType] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string>("invisible");
  const [surname, setSurname] = useState<string>("");
  const [surnameError, setSurnameError] = useState<string>("invisible");
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("invisible");
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("invisible");
  const [err, setErr] = useState<string>("Incorrect Email");
  const router = useRouter();

  function changeShowPassword(par: boolean) {
    setShowPassword(par);
    setPasswordType(!passwordType);
  }
  useEffect(() => {
    if (password) setShowShowPassword("");
    else setShowShowPassword("invisible");
  }, [password]);

  async function createUser() {
    try {
      const res = await axiosInstance.post("/users/register", {
        email: email,
        password: password,
        name: username,
        surname: surname,
      });
      if (res.data.success) {
        router.push("/");
      }
    } catch (error) {}
  }

  function handleForm(e: React.ChangeEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (username.includes(" ") || !username) {
      setUsernameError("");
      return;
    } else setUsernameError("invisible");
    if (surname.includes(" ") || !surname) {
      setSurnameError("");
      return;
    } else setSurnameError("invisible");
    if (
      !String(email)
        .toLowerCase()
        .match(/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/)
    ) {
      setEmailError("visible");
      return;
    } else setEmailError("invisible");
    if (password.length < 6) {
      setPasswordError("visible");
      return;
    } else setPasswordError("invisible");
    createUser();
  }

  return (
    <div className="btn-blue-pink h-[100vh] flex flex-col items-center justify-center">
      <form
        onSubmit={handleForm}
        className="bg-white border-[1px] rounded-lg flex items-center flex-col  w-[400px] p-7 ">
        <div className="flex flex-col items-center gap-5">
          <h1 className="text-2xl font-bold">Sign Up</h1>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label className="light-gray text-xs font-medium">Username</label>
              <div className="flex flex-col">
                <div className="flex gap-2 border-b-2 pb-1 items-center">
                  <Image
                    src="/icons/person.png"
                    width={24}
                    height={24}
                    alt="person"
                  />
                  <input
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                    size={25}
                    className="login-input mb-1"
                    type="text"
                    placeholder="Type your username"
                  />
                </div>
                <span className={`dark-red text-xs ${usernameError}`}>
                  There should be no space
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="light-gray text-xs font-medium">Surname</label>
              <div className="flex flex-col">
                <div className="flex gap-2 border-b-2 pb-1 items-center">
                  <Image
                    src="/icons/person.png"
                    width={24}
                    height={24}
                    alt="person"
                  />
                  <input
                    onChange={(e) => setSurname(e.target.value)}
                    value={surname}
                    size={25}
                    className="login-input mb-1"
                    type="text"
                    placeholder="Type your surname"
                  />
                </div>
                <span className={`dark-red text-xs ${surnameError}`}>
                  There should be no space
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="light-gray text-xs font-medium">Email</label>
              <div className="flex flex-col">
                <div className="flex gap-2 border-b-2 pb-1 items-center">
                  <Image
                    src="/icons/email.png"
                    width={24}
                    height={24}
                    alt="person"
                  />
                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    size={25}
                    className="login-input mb-1"
                    type="email"
                    placeholder="Type your email"
                  />
                </div>
                <span className={`dark-red text-xs ${emailError}`}>{err}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="light-gray text-xs font-medium">Password</label>
              <div className="flex flex-col">
                <div className="flex gap-1 border-b-2 pb-1 items-center">
                  <Image
                    src="/icons/password.png"
                    width={24}
                    height={24}
                    alt="password"
                  />
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    size={25}
                    className="login-input mb-1"
                    type={passwordType ? "text" : "password"}
                    placeholder="Type your password"
                  />
                  <PasswordShow
                    showShowPassword={showShowPassword}
                    showPassword={showPassword}
                    changeShowPassword={changeShowPassword}
                  />
                </div>
                <span className={`dark-red text-xs ${passwordError}`}>
                  Password should be at least 6 characters
                </span>
              </div>
            </div>
            <button className="btn-blue-pink mt-1 py-2 rounded-full text-white text-xs font-medium">
              SIGN UP
            </button>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <span className="light-gray text-xs font-medium">
              Or Sign Up Using
            </span>
            <div className="flex gap-2">
              <Image
                className="cursor-pointer"
                src="/icons/google.png"
                width={30}
                height={30}
                alt="google"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-3 items-center">
          <Link
            className="hover:dark-red light-gray text-xs font-medium"
            href="/login">
            OR LOGIN
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignUp;

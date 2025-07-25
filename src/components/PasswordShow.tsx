import { useEffect, useState } from "react";

type PasswordShowProps = {
  showShowPassword: string;
  showPassword: boolean;
  changeShowPassword: (param: boolean) => void;
};

const PasswordShow = ({
  showShowPassword,
  showPassword,
  changeShowPassword,
}: PasswordShowProps) => {
  const [dot1, setDot1] = useState<string>("text-xl");
  const [dot2, setDot2] = useState<string>("text-xl");
  const [dot3, setDot3] = useState<string>("text-xl");
  const [text1, setText1] = useState<string>("∙");
  const [text2, setText2] = useState<string>("∙");
  const [text3, setText3] = useState<string>("∙");
  useEffect(() => {
    if (showPassword) {
      setTimeout(() => {
        setDot1("invisible text-xl");
      }, 100);
      setTimeout(() => {
        setDot2("invisible text-xl");
      }, 200);
      setTimeout(() => {
        setDot3("invisible text-xl");
        setText1("3");
        setDot1("text-[0.625rem]");
      }, 300);
      setTimeout(() => {
        setText2("y");
        setDot2("text-[0.625rem]");
      }, 400);
      setTimeout(() => {
        setText3("3");
        setDot3("text-[0.625rem]");
      }, 500);
    } else {
      setTimeout(() => {
        setDot1("invisible text-[0.625rem]");
      }, 100);
      setTimeout(() => {
        setDot2("invisible text-[0.625rem]");
      }, 200);
      setTimeout(() => {
        setDot3("invisible text-[0.625rem]");
        setText1("∙");
        setDot1("text-xl");
      }, 300);
      setTimeout(() => {
        setText2("∙");
        setDot2("text-xl");
      }, 400);
      setTimeout(() => {
        setText3("∙");
        setDot3("text-xl");
      }, 500);
    }
  }, [showPassword]);
  return (
    <div
      className={`${showShowPassword} bg-[#4148AA] rounded-full`}
      onClick={() => changeShowPassword(!showPassword)}>
      <div className="transition-all ease-linear duration-100 bg-blue w-7 cursor-pointer flex items-center justify-center h-7 rounded-full">
        <span className={`text-white ${dot1}`}>{text1}</span>
        <span className={`text-white ${dot2} mx-[0.0625rem]`}>{text2}</span>
        <span className={`text-white ${dot3}`}>{text3}</span>
      </div>
    </div>
  );
};

export default PasswordShow;

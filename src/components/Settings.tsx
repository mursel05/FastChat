"use client";
import { DataContext } from "@/context/ApiContext";
import axiosInstance from "@/utils/axios";
import Image from "next/image";
import React, { useContext, useRef, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const Settings = () => {
  const { user, setOpen } = useContext(DataContext);
  const [hover, setHover] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    photo: user?.photo || "",
  });
  const router = useRouter();

  async function uploadImage() {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axiosInstance.post("/files", formData);
      if (res.data.success) {
        return res.data.data.filePath;
      }
    }
    return null;
  }

  async function handleForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      let updatedPhoto = formData.photo;
      if (file) {
        const uploadedPath = await uploadImage();
        if (uploadedPath) {
          updatedPhoto = uploadedPath;
        }
      }
      const res = await axiosInstance.put("/users", {
        ...formData,
        photo: updatedPhoto,
      });
      if (res.data.success) {
        Swal.fire({
          title: "Profile Updated",
          icon: "success",
          confirmButtonText: "OK",
        });
      }
    } catch {}
  }

  async function logOut() {
    try {
      const res = await axiosInstance.post("/users/logout");
      if (res.data.success) {
        document.location.reload();
      }
    } catch {}
  }

  return (
    <div className="flex items-center justify-center h-full">
      <form
        className="bg-white rounded-md p-8 flex flex-col gap-4"
        onSubmit={handleForm}>
        <div
          className="cursor-pointer relative w-max self-center mb-2"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => fileInputRef.current?.click()}>
          <Image
            src={
              file
                ? URL.createObjectURL(file)
                : user?.photo || "/images/no-profile.jpg"
            }
            width={100}
            height={100}
            alt="profile picture"
            className="rounded-full w-[5rem] h-[5rem]"
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0]);
              }
            }}
          />
          {hover && (
            <div className="absolute w-full h-full flex items-center justify-center top-0 left-0 rounded-full bg-black/30">
              <Image
                src="/icons/upload.png"
                width={24}
                height={24}
                alt="upload icon"
                className="w-6 h-6"
              />
            </div>
          )}
        </div>
        <input
          type="text"
          placeholder="Name"
          className="border border-[#ccc] rounded-md p-2 outline-none"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Surname"
          className="border border-[#ccc] rounded-md p-2 outline-none"
          value={formData.surname}
          onChange={(e) =>
            setFormData({ ...formData, surname: e.target.value })
          }
        />
        <button
          type="submit"
          className="self-center py-2 w-full bg-blue-500 cursor-pointer text-white rounded-xl hover:bg-blue-600">
          Save
        </button>
        <button
          type="button"
          onClick={() => setOpen("")}
          className="self-center py-2 w-full bg-gray-500 cursor-pointer text-white rounded-xl hover:bg-gray-600">
          Cancel
        </button>
        <button
          type="button"
          className="self-center py-2 w-full bg-red-500 cursor-pointer text-white rounded-xl hover:bg-red-600"
          onClick={logOut}>
          Log Out
        </button>
      </form>
    </div>
  );
};

export default Settings;

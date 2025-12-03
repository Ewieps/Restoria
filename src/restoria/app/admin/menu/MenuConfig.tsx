"use client";

import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";

export default function MenuConfiguration() {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
  });
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    onClientUploadComplete: (res) => {
      console.log("Client upload complete:", res);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.message}`);
    },
    onUploadBegin: () => {
      console.log("Upload started");
    }
});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to add a menu item.");
      return;
    }

    setUploading(true);

    try {
      let finalImageUrl = "";

      if (selectedFile) {
        console.log("Starting upload...");
        const uploadedFiles = await startUpload([selectedFile]);
        console.log("Upload result:", uploadedFiles);
        
        if (uploadedFiles && uploadedFiles[0]) {
          finalImageUrl = uploadedFiles[0].url;
          console.log("Final image URL:", finalImageUrl);
        } else {
          throw new Error("Upload failed - no URL returned");
        }
      }

      const response = await fetch("/api/menu-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          image: finalImageUrl,
        }),
      });

      if (response.ok) {
        alert("Menu item added successfully!");
        setFormData({ name: "", price: "", description: "", category: "" });
        setImageUrl("");
        setSelectedFile(null);
      } else {
        const error = await response.json();
        alert(`Failed to add menu item: ${error.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`An error occurred: ${error}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-4">
      <div>
        <label className="block mb-2 font-medium">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Price</label>
        <input
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full border p-2 rounded"
          rows={3}
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Category</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full border p-2 rounded"
        />
        {imageUrl && (
          <div className="mt-4">
            <img
              src={imageUrl}
              alt="Preview"
              className="max-w-xs rounded border"
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {uploading ? "Uploading..." : "Add Menu Item"}
      </button>
    </form>
  );
}
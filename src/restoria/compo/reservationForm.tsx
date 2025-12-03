"use client";

import { useState } from "react";

interface ReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: ReservationData) => void;
}

interface ReservationData {
  name: string;
  contact: string;
  date: string;
  time: string;
  guests: number;
  note?: string;
}

export default function ReservationForm({
  isOpen,
  onClose,
  onSubmit,
}: ReservationFormProps) {
  const [formData, setFormData] = useState<ReservationData>({
    name: "",
    contact: "",
    date: "",
    time: "",
    guests: 2,
    note: "",
  });

  const [errors, setErrors] = useState<Partial<ReservationData>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "guests" ? parseInt(value) || 0 : value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof ReservationData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ReservationData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama lengkap wajib diisi";
    }
    if (!formData.contact.trim()) {
      newErrors.contact = "Kontak wajib diisi";
    }
    if (!formData.date) {
      newErrors.date = "Tanggal wajib dipilih";
    }
    if (!formData.time) {
      newErrors.time = "Waktu wajib dipilih";
    }
    if (formData.guests < 1) {
      newErrors.guests = 1;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit?.(formData);
      // Reset form
      setFormData({
        name: "",
        contact: "",
        date: "",
        time: "",
        guests: 2,
        note: "",
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-fadeIn rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            Buat Reservasi
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Nama Lengkap */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Nama Lengkap
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-black placeholder-zinc-400 transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email/Contact */}
            <div>
              <label
                htmlFor="contact"
                className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Email / No. Telepon
              </label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="email@example.com atau 08123456789"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-black placeholder-zinc-400 transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
              />
              {errors.contact && (
                <p className="mt-1 text-xs text-red-500">{errors.contact}</p>
              )}
            </div>

            {/* Tanggal & Waktu */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="date"
                  className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Tanggal
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-black transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:[color-scheme:dark]"
                />
                {errors.date && (
                  <p className="mt-1 text-xs text-red-500">{errors.date}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="time"
                  className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Waktu
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-black transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:[color-scheme:dark]"
                />
                {errors.time && (
                  <p className="mt-1 text-xs text-red-500">{errors.time}</p>
                )}
              </div>
            </div>

            {/* Jumlah Orang */}
            <div>
              <label
                htmlFor="guests"
                className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Jumlah Orang
              </label>
              <input
                type="number"
                id="guests"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                min="1"
                max="20"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-black transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            {/* Catatan (Optional) */}
            <div>
              <label
                htmlFor="note"
                className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Catatan <span className="text-zinc-400">(Opsional)</span>
              </label>
              <textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows={3}
                placeholder="Contoh: Alergi makanan, permintaan khusus, dll"
                className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-black placeholder-zinc-400 transition-all focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-teal-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition-all hover:bg-teal-600 hover:shadow-xl hover:shadow-teal-500/40 active:scale-[0.98]"
          >
            Konfirmasi Reservasi
          </button>
        </form>
      </div>
    </div>
  );
}
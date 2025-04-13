// components/GenericForm.tsx

'use client';

import { useState } from "react";

type FieldType = {
  label: string;
  type: string;
  required?: boolean;
};

type GenericFormProps = {
  apiRoute: string;
  fields: Record<string, FieldType>;
  userId: string;
  entryId?: string;
  defaultValues?: Record<string, any>;
};

export default function GenericForm({
  apiRoute,
  fields,
  userId,
  entryId,
  defaultValues = {},
}: GenericFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(defaultValues);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, valueAsNumber } = e.target;
    setFormData({
      ...formData,
      ...(entryId && { id: entryId }),
      [name]: type === "number" ? valueAsNumber : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const response = await fetch(apiRoute, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to submit");

      // Reset form data after submission
      setFormData(defaultValues);
      (e.target as HTMLFormElement).reset();
      setStatus("success");
    } catch (err) {
      console.error("Form submit error:", err);
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {Object.entries(fields).map(([name, field]) => (
        <div key={name} className="flex flex-col">
          <label className="text-sm font-medium">{field.label}</label>
          <input
            name={name}
            type={field.type}
            required={field.required}
            onChange={handleChange}
            value={formData[name] ?? ""}
            className="border rounded-md px-3 py-2"
          />
        </div>
      ))}

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Submitting..." : "Submit"}
      </button>

      {status === "success" && (
        <p className="text-green-600">Submitted successfully!</p>
      )}
      {status === "error" && (
        <p className="text-red-600">Submission failed. Try again.</p>
      )}
    </form>
  );
}

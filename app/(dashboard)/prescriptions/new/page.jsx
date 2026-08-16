"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";

function PrescriptionFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get("patientId") || "";
  const preselectedRecordId = searchParams.get("medicalRecordId") || "";

  const [currentUser, setCurrentUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [medicinesList, setMedicinesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [patientId, setPatientId] = useState(preselectedPatientId);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([
    { medicineId: "", medicineName: "", dosage: "1 tablet", frequency: "Twice daily", duration: "5 days", quantity: 10 },
  ]);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const [profileRes, patientsRes, medRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/patients"),
        fetch("/api/medicines"),
      ]);

      const profileData = await profileRes.json();
      const patientsData = await patientsRes.json();
      const medData = await medRes.json();

      if (profileRes.ok) setCurrentUser(profileData.user);
      if (patientsRes.ok) setPatients(patientsData.patients || []);
      if (medRes.ok) setMedicinesList(medData.medicines || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { medicineId: "", medicineName: "", dosage: "1 tablet", frequency: "Twice daily", duration: "5 days", quantity: 10 },
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleMedicineSelect = (index, medId) => {
    const selected = medicinesList.find((m) => m._id === medId);
    const updated = [...items];
    updated[index].medicineId = medId;
    updated[index].medicineName = selected ? selected.name : "";
    setItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          medicalRecordId: preselectedRecordId || null,
          medicines: items,
          notes,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/prescriptions");
        router.refresh();
      } else {
        throw new Error(data.error || "Failed to issue prescription");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={currentUser}>
        <div className="p-8 text-center text-slate-500">Loading prescription options...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={currentUser}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Issue Prescription 💊</h1>
          <p className="text-sm text-slate-500">
            Prescribe medicines, dosage instructions, and duration for consultation
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-danger text-sm rounded-btn">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-card border border-border shadow-xs space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Select Patient *
            </label>
            <select
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.userId?.name} ({p.userId?.email})
                </option>
              ))}
            </select>
          </div>

          {/* Medicines Items List */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-navy uppercase tracking-wider">
                Prescribed Medicines *
              </h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-semibold text-primary hover:underline"
              >
                + Add Another Medicine
              </button>
            </div>

            {items.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-btn border border-border space-y-3 relative">
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="absolute top-2 right-2 text-xs text-danger font-semibold hover:underline"
                  >
                    Remove
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Medicine Item *
                    </label>
                    <select
                      required
                      value={item.medicineId}
                      onChange={(e) => handleMedicineSelect(idx, e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-btn text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">-- Select Medicine --</option>
                      {medicinesList.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name} (${m.price?.toFixed(2)}) — Stock: {m.stockQuantity}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Dosage Instructions *
                    </label>
                    <input
                      type="text"
                      required
                      value={item.dosage}
                      onChange={(e) => handleItemChange(idx, "dosage", e.target.value)}
                      placeholder="e.g. 1 tablet after meals"
                      className="w-full px-3 py-2 border border-border rounded-btn text-xs focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Frequency *
                    </label>
                    <input
                      type="text"
                      required
                      value={item.frequency}
                      onChange={(e) => handleItemChange(idx, "frequency", e.target.value)}
                      placeholder="e.g. Twice daily"
                      className="w-full px-3 py-2 border border-border rounded-btn text-xs focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Duration *
                      </label>
                      <input
                        type="text"
                        required
                        value={item.duration}
                        onChange={(e) => handleItemChange(idx, "duration", e.target.value)}
                        placeholder="e.g. 5 days"
                        className="w-full px-3 py-2 border border-border rounded-btn text-xs focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                        className="w-full px-3 py-2 border border-border rounded-btn text-xs focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Doctor Instructions / Special Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Take with plenty of water. Finish entire course."
              className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-btn hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-blue-700 disabled:opacity-50 transition shadow-xs"
            >
              {saving ? "Issuing..." : "Issue Prescription"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function NewPrescriptionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading form...</div>}>
      <PrescriptionFormContent />
    </Suspense>
  );
}

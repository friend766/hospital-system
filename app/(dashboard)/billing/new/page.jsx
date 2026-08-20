"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";

function NewInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlPrescriptionId = searchParams.get("prescriptionId");
  const urlPatientId = searchParams.get("patientId");

  const [currentUser, setCurrentUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedMedId, setSelectedMedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [patientId, setPatientId] = useState(urlPatientId || "");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [items, setItems] = useState([]);

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

      let isPharm = false;
      if (profileRes.ok && profileData.user) {
        setCurrentUser(profileData.user);
        isPharm = profileData.user.role === "pharmacist";
      }

      if (patientsRes.ok) setPatients(patientsData.patients || []);
      const allMeds = medData.medicines || [];
      if (medRes.ok) setMedicines(allMeds);

      // Check if arriving from a Prescription Dispense action!
      if (urlPrescriptionId) {
        const presRes = await fetch(`/api/prescriptions/${urlPrescriptionId}`);
        const presData = await presRes.json();

        if (presRes.ok && presData.prescription) {
          const pres = presData.prescription;
          if (pres.patientId?._id) {
            setPatientId(pres.patientId._id);
          }

          // Build line items from prescribed medicines
          const autoItems = pres.medicines.map((item) => {
            const matchedMed = allMeds.find((m) => m.name.toLowerCase() === item.medicineName.toLowerCase());
            return {
              description: `${item.medicineName} (${item.dosage || "Prescribed"})`,
              quantity: item.quantity || 1,
              amount: matchedMed?.price || 15.0,
            };
          });

          // Always add Pharmacy Dispensing Fee
          autoItems.push({
            description: "Pharmacy Dispensing Fee",
            quantity: 1,
            amount: 10.0,
          });

          setItems(autoItems);
          return;
        }
      }

      // Default presets if no prescription ID
      if (isPharm) {
        setItems([{ description: "Pharmacy Dispensing Fee", quantity: 1, amount: 10 }]);
      } else {
        setItems([{ description: "Doctor Consultation Fee", quantity: 1, amount: 50 }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicineToBill = () => {
    if (!selectedMedId) return;
    const med = medicines.find((m) => m._id === selectedMedId);
    if (!med) return;

    const existingIndex = items.findIndex((i) => i.description.startsWith(med.name));
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      setItems(updated);
    } else {
      const hasDispensingFee = items.some((i) => i.description === "Pharmacy Dispensing Fee");
      const newItem = {
        description: `${med.name} (${med.dosageForm || "Tablet"})`,
        quantity: 1,
        amount: med.price || 0,
      };

      if (hasDispensingFee) {
        const feeIndex = items.findIndex((i) => i.description === "Pharmacy Dispensing Fee");
        const copy = [...items];
        copy.splice(feeIndex, 0, newItem);
        setItems(copy);
      } else {
        setItems([...items, newItem]);
      }
    }
    setSelectedMedId("");
  };

  const handleAddItem = (presetDesc = "", presetPrice = 0) => {
    setItems([
      ...items,
      { description: presetDesc || "", quantity: 1, amount: presetPrice || 0 },
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const totalAmount = items.reduce(
    (acc, curr) => acc + Number(curr.amount || 0) * Number(curr.quantity || 1),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          paymentMethod,
          items,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/billing");
        router.refresh();
      } else {
        throw new Error(data.error || "Failed to generate invoice");
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
        <div className="p-8 text-center text-slate-500">Loading billing portal...</div>
      </DashboardLayout>
    );
  }

  const isPharmacist = currentUser?.role === "pharmacist";

  return (
    <DashboardLayout user={currentUser}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-navy">Generate Invoice 🧾</h1>
            <span className="text-xs px-2.5 py-0.5 rounded font-semibold bg-blue-100 text-primary border border-blue-200">
              {isPharmacist ? "Pharmacy Counter Billing" : "Hospital Front-Desk Billing"}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            {urlPrescriptionId
              ? "✨ Prescribed medicines automatically loaded into invoice!"
              : isPharmacist
              ? "Select medicines bought by patient and apply pharmacy dispensing fees"
              : "Bill doctor consultation fees, hospital registration, and lab diagnostics"}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-danger text-sm rounded-btn">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-card border border-border shadow-xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card / Debit</option>
                <option value="Insurance">Health Insurance</option>
                <option value="Pending">Pending Payment</option>
              </select>
            </div>
          </div>

          {/* Pharmacist Medicine Item Picker */}
          {isPharmacist && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-btn space-y-3">
              <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                💊 Add Additional Medicine to Bill:
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedMedId}
                  onChange={(e) => setSelectedMedId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-emerald-300 rounded-btn text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select Medicine from Inventory --</option>
                  {medicines.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} (${m.price?.toFixed(2)}) — Stock: {m.stockQuantity}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddMedicineToBill}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-btn hover:bg-emerald-700 transition shadow-xs"
                >
                  + Add Medicine to Bill
                </button>
              </div>
            </div>
          )}

          {/* Line Items Table */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-navy uppercase tracking-wider">
                Invoice Billed Items *
              </h2>
              <button
                type="button"
                onClick={() => handleAddItem("", 0)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                + Add Custom Item
              </button>
            </div>

            {items.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-3 items-center p-3 bg-slate-50 rounded-btn border border-border">
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    required
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                    placeholder="Description (e.g. Paracetamol 500mg, Consultation Fee)"
                    className="w-full px-3 py-2 border border-border rounded-btn text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="w-24">
                  <input
                    type="number"
                    required
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                    placeholder="Qty"
                    className="w-full px-3 py-2 border border-border rounded-btn text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="w-32">
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={item.amount}
                    onChange={(e) => handleItemChange(idx, "amount", Number(e.target.value))}
                    placeholder="Price ($)"
                    className="w-full px-3 py-2 border border-border rounded-btn text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-xs text-danger font-semibold hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border border-border rounded-btn flex justify-between items-center">
            <span className="font-bold text-navy text-sm">Calculated Total Amount:</span>
            <span className="text-xl font-bold text-primary">${totalAmount.toFixed(2)}</span>
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
              {saving ? "Generating..." : "Generate Invoice"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading invoice form...</div>}>
      <NewInvoiceContent />
    </Suspense>
  );
}

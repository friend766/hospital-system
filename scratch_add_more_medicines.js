const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const MONGODB_URI = "mongodb+srv://ammadashraf7792_db_user:aBkcmLIL1cSaxQjv@cluster0.ovah27l.mongodb.net/hospital_db?retryWrites=true&w=majority";

const MedicineSchema = new mongoose.Schema({
  name: String,
  genericName: String,
  category: String,
  price: Number,
  stockQuantity: Number,
  lowStockThreshold: Number,
  dosageForm: String,
  expiryDate: String,
}, { timestamps: true });

const Medicine = mongoose.models.Medicine || mongoose.model("Medicine", MedicineSchema);

async function addMoreMedicines() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB...");

    const medicinesData = [
      // Painkillers & Anti-Inflammatories
      { name: "Paracetamol 500mg", genericName: "Acetaminophen", category: "Painkillers", price: 5.5, stockQuantity: 250, lowStockThreshold: 30, dosageForm: "Tablet", expiryDate: "2027-12-31" },
      { name: "Ibuprofen 400mg", genericName: "Ibuprofen", category: "Painkillers", price: 12.0, stockQuantity: 14, lowStockThreshold: 20, dosageForm: "Tablet", expiryDate: "2026-11-20" },
      { name: "Aspirin 81mg", genericName: "Acetylsalicylic Acid", category: "Painkillers", price: 7.25, stockQuantity: 180, lowStockThreshold: 25, dosageForm: "Tablet", expiryDate: "2027-08-15" },
      { name: "Diclofenac Sodium 50mg", genericName: "Diclofenac", category: "Painkillers", price: 11.0, stockQuantity: 90, lowStockThreshold: 15, dosageForm: "Tablet", expiryDate: "2027-05-10" },
      { name: "Tramadol 50mg", genericName: "Tramadol HCl", category: "Painkillers", price: 28.0, stockQuantity: 40, lowStockThreshold: 10, dosageForm: "Capsule", expiryDate: "2026-12-01" },

      // Antibiotics & Antifungals
      { name: "Amoxicillin 500mg", genericName: "Amoxicillin Trihydrate", category: "Antibiotics", price: 18.5, stockQuantity: 120, lowStockThreshold: 20, dosageForm: "Capsule", expiryDate: "2027-09-30" },
      { name: "Ciprofloxacin 500mg", genericName: "Ciprofloxacin HCl", category: "Antibiotics", price: 22.0, stockQuantity: 8, lowStockThreshold: 15, dosageForm: "Tablet", expiryDate: "2026-10-15" },
      { name: "Azithromycin 500mg", genericName: "Azithromycin Dihydrate", category: "Antibiotics", price: 26.0, stockQuantity: 65, lowStockThreshold: 15, dosageForm: "Tablet", expiryDate: "2027-04-20" },
      { name: "Cephradine 500mg", genericName: "Cephradine", category: "Antibiotics", price: 21.0, stockQuantity: 80, lowStockThreshold: 15, dosageForm: "Capsule", expiryDate: "2027-03-12" },
      { name: "Fluconazole 150mg", genericName: "Fluconazole", category: "Antibiotics", price: 15.0, stockQuantity: 50, lowStockThreshold: 10, dosageForm: "Capsule", expiryDate: "2027-07-25" },

      // Cardiovascular & Hypertension
      { name: "Amlodipine 5mg", genericName: "Amlodipine Besylate", category: "Cardiovascular", price: 14.0, stockQuantity: 140, lowStockThreshold: 20, dosageForm: "Tablet", expiryDate: "2028-02-28" },
      { name: "Metoprolol 50mg", genericName: "Metoprolol Tartrate", category: "Cardiovascular", price: 16.5, stockQuantity: 110, lowStockThreshold: 20, dosageForm: "Tablet", expiryDate: "2027-11-15" },
      { name: "Atorvastatin 20mg", genericName: "Atorvastatin Calcium", category: "Cardiovascular", price: 32.0, stockQuantity: 95, lowStockThreshold: 15, dosageForm: "Tablet", expiryDate: "2028-01-10" },
      { name: "Lisinopril 10mg", genericName: "Lisinopril", category: "Cardiovascular", price: 18.0, stockQuantity: 130, lowStockThreshold: 20, dosageForm: "Tablet", expiryDate: "2027-10-05" },

      // Gastrointestinal & Diabetes
      { name: "Omeprazole 20mg", genericName: "Omeprazole", category: "Gastrointestinal", price: 14.5, stockQuantity: 95, lowStockThreshold: 20, dosageForm: "Capsule", expiryDate: "2027-06-30" },
      { name: "Metformin 850mg", genericName: "Metformin HCl", category: "Endocrinology / Diabetes", price: 24.0, stockQuantity: 85, lowStockThreshold: 15, dosageForm: "Tablet", expiryDate: "2027-09-18" },
      { name: "Insulin Glargine 100IU/ml", genericName: "Insulin Glargine", category: "Endocrinology / Diabetes", price: 45.0, stockQuantity: 12, lowStockThreshold: 10, dosageForm: "Injection", expiryDate: "2026-09-20" },

      // Respiratory & Antihistamines
      { name: "Cetirizine 10mg", genericName: "Cetirizine Dihydrochloride", category: "Respiratory", price: 8.0, stockQuantity: 180, lowStockThreshold: 25, dosageForm: "Tablet", expiryDate: "2028-01-15" },
      { name: "Salbutamol Inhaler 100mcg", genericName: "Albuterol / Salbutamol", category: "Respiratory", price: 19.5, stockQuantity: 6, lowStockThreshold: 12, dosageForm: "Inhaler", expiryDate: "2026-08-30" },
      { name: "Montelukast 10mg", genericName: "Montelukast Sodium", category: "Respiratory", price: 25.0, stockQuantity: 70, lowStockThreshold: 15, dosageForm: "Tablet", expiryDate: "2027-12-10" },

      // Vitamins & Supplements
      { name: "Vitamin C 1000mg", genericName: "Ascorbic Acid", category: "Vitamins & Supplements", price: 9.99, stockQuantity: 200, lowStockThreshold: 25, dosageForm: "Tablet", expiryDate: "2028-05-20" },
      { name: "Multivitamin + Minerals", genericName: "Essential Vitamins", category: "Vitamins & Supplements", price: 14.99, stockQuantity: 160, lowStockThreshold: 20, dosageForm: "Tablet", expiryDate: "2028-04-15" },
      { name: "Calcium + Vitamin D3", genericName: "Calcium Carbonate + D3", category: "Vitamins & Supplements", price: 12.50, stockQuantity: 110, lowStockThreshold: 20, dosageForm: "Tablet", expiryDate: "2027-11-30" },
    ];

    let insertedCount = 0;
    let updatedCount = 0;

    for (const m of medicinesData) {
      const res = await Medicine.findOneAndUpdate(
        { name: m.name },
        m,
        { upsert: true, new: true }
      );
      if (res) insertedCount++;
    }

    const totalInDb = await Medicine.countDocuments();
    console.log(`Successfully added/updated medicines! Total count in inventory DB: ${totalInDb}`);
  } catch (err) {
    console.error("Error adding medicines:", err);
  } finally {
    await mongoose.disconnect();
  }
}

addMoreMedicines();

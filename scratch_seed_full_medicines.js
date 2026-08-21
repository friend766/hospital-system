const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://ammadashraf7792_db_user:aBkcmLIL1cSaxQjv@cluster0.ovah27l.mongodb.net/hospital_db?retryWrites=true&w=majority";

const defaultMedicines = [
  { name: "Paracetamol 500mg", genericName: "Acetaminophen", category: "Analgesic & Antipyretic", price: 12.50, stockQuantity: 450, lowStockThreshold: 50, dosageForm: "Tablet", expiryDate: "2027-12-31" },
  { name: "Amoxicillin 500mg", genericName: "Amoxicillin Trihydrate", category: "Antibiotic", price: 35.00, stockQuantity: 120, lowStockThreshold: 30, dosageForm: "Capsule", expiryDate: "2026-10-15" },
  { name: "Ibuprofen 400mg", genericName: "Ibuprofen", category: "NSAID / Pain Relief", price: 18.00, stockQuantity: 8, lowStockThreshold: 25, dosageForm: "Tablet", expiryDate: "2027-08-20" },
  { name: "Metformin 500mg", genericName: "Metformin Hydrochloride", category: "Anti-Diabetic", price: 22.00, stockQuantity: 300, lowStockThreshold: 40, dosageForm: "Tablet", expiryDate: "2028-01-10" },
  { name: "Omeprazole 20mg", genericName: "Omeprazole", category: "Antacid / PPI", price: 28.50, stockQuantity: 180, lowStockThreshold: 20, dosageForm: "Capsule", expiryDate: "2026-11-30" },
  { name: "Ciprofloxacin 500mg", genericName: "Ciprofloxacin", category: "Antibiotic", price: 42.00, stockQuantity: 5, lowStockThreshold: 15, dosageForm: "Tablet", expiryDate: "2027-05-18" },
  { name: "Atorvastatin 20mg", genericName: "Atorvastatin Calcium", category: "Cardiovascular", price: 55.00, stockQuantity: 210, lowStockThreshold: 30, dosageForm: "Tablet", expiryDate: "2028-03-25" },
  { name: "Azithromycin 250mg", genericName: "Azithromycin", category: "Antibiotic", price: 65.00, stockQuantity: 90, lowStockThreshold: 20, dosageForm: "Tablet", expiryDate: "2026-09-14" },
  { name: "Losartan 50mg", genericName: "Losartan Potassium", category: "Antihypertensive", price: 30.00, stockQuantity: 160, lowStockThreshold: 25, dosageForm: "Tablet", expiryDate: "2027-07-04" },
  { name: "Cetirizine 10mg", genericName: "Cetirizine Dihydrochloride", category: "Antihistamine", price: 15.00, stockQuantity: 350, lowStockThreshold: 50, dosageForm: "Tablet", expiryDate: "2028-06-30" },
  { name: "Panadol Extra", genericName: "Paracetamol + Caffeine", category: "Analgesic", price: 15.00, stockQuantity: 500, lowStockThreshold: 50, dosageForm: "Tablet", expiryDate: "2027-11-12" },
  { name: "Augmentin 625mg", genericName: "Amoxicillin + Clavulanate", category: "Antibiotic", price: 85.00, stockQuantity: 75, lowStockThreshold: 20, dosageForm: "Tablet", expiryDate: "2026-12-01" },
  { name: "Disprin 300mg", genericName: "Aspirin", category: "Blood Thinner", price: 10.00, stockQuantity: 4, lowStockThreshold: 30, dosageForm: "Tablet", expiryDate: "2027-04-15" },
  { name: "Flagyl 400mg", genericName: "Metronidazole", category: "Antiprotozoal / Antibiotic", price: 20.00, stockQuantity: 220, lowStockThreshold: 30, dosageForm: "Tablet", expiryDate: "2027-10-10" },
  { name: "Softin 10mg", genericName: "Loratadine", category: "Antihistamine", price: 16.00, stockQuantity: 140, lowStockThreshold: 25, dosageForm: "Tablet", expiryDate: "2028-02-18" },
  { name: "Gaviscon Syrup 120ml", genericName: "Sodium Alginate + Antacids", category: "Antacid / Gastro", price: 120.00, stockQuantity: 45, lowStockThreshold: 10, dosageForm: "Syrup", expiryDate: "2026-08-30" },
  { name: "Brufen Syrup 90ml", genericName: "Ibuprofen Pediatric", category: "Analgesic Syrup", price: 70.00, stockQuantity: 60, lowStockThreshold: 15, dosageForm: "Syrup", expiryDate: "2027-01-20" },
  { name: "Arinac Forte", genericName: "Ibuprofen + Pseudoephedrine", category: "Cold & Decongestant", price: 45.00, stockQuantity: 3, lowStockThreshold: 20, dosageForm: "Tablet", expiryDate: "2026-11-15" },
  { name: "Ventolin Inhaler", genericName: "Salbutamol", category: "Respiratory / Bronchodilator", price: 250.00, stockQuantity: 35, lowStockThreshold: 10, dosageForm: "Inhaler", expiryDate: "2027-09-30" },
  { name: "Polyfax Eye Ointment", genericName: "Polymyxin B + Bacitracin", category: "Ophthalmic Antibiotic", price: 50.00, stockQuantity: 80, lowStockThreshold: 15, dosageForm: "Ointment", expiryDate: "2027-03-10" },
  { name: "Dermovate Cream 20g", genericName: "Clobetasol Propionate", category: "Dermatological Steroid", price: 95.00, stockQuantity: 55, lowStockThreshold: 10, dosageForm: "Cream", expiryDate: "2027-06-25" },
  { name: "Surbex Z", genericName: "Multivitamins + Zinc", category: "Nutritional Supplement", price: 180.00, stockQuantity: 110, lowStockThreshold: 20, dosageForm: "Tablet", expiryDate: "2028-05-15" },
  { name: "Cac-1000 Plus", genericName: "Calcium + Vitamin D3 + C", category: "Effervescent Calcium", price: 220.00, stockQuantity: 95, lowStockThreshold: 15, dosageForm: "Tablet", expiryDate: "2028-04-30" }
];

async function seedMedicines() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB Atlas");

    const db = mongoose.connection.db;

    // Get Central City Hospital Org
    const centralCityOrg = await db.collection('organizations').findOne({ slug: 'central-city-hospital' });
    if (!centralCityOrg) {
      console.error("Central City Hospital org not found!");
      await mongoose.disconnect();
      return;
    }

    const orgId = centralCityOrg._id;

    // Clear and insert medicines for Central City Hospital
    await db.collection('medicines').deleteMany({ organizationId: orgId });

    const medicinesToInsert = defaultMedicines.map(m => ({
      ...m,
      organizationId: orgId,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await db.collection('medicines').insertMany(medicinesToInsert);

    const count = await db.collection('medicines').countDocuments({ organizationId: orgId });
    console.log(`SUCCESS: Seeded ${count} medicines for Central City Hospital pharmacy inventory!`);

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error seeding medicines:", err);
  }
}

seedMedicines();

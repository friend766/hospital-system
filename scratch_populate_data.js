const mongoose = require("mongoose");
const dns = require("dns");
const bcrypt = require("bcryptjs");

dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const MONGODB_URI = "mongodb+srv://ammadashraf7792_db_user:aBkcmLIL1cSaxQjv@cluster0.ovah27l.mongodb.net/hospital_db?retryWrites=true&w=majority";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  phone: String,
}, { timestamps: true });

const DoctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  specialization: String,
  department: String,
  availability: {
    days: [String],
    timeSlots: [String],
  },
}, { timestamps: true });

const PatientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dateOfBirth: String,
  gender: String,
  address: String,
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String,
  },
}, { timestamps: true });

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

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
const Patient = mongoose.models.Patient || mongoose.model("Patient", PatientSchema);
const Medicine = mongoose.models.Medicine || mongoose.model("Medicine", MedicineSchema);

async function populateData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB...");

    const defaultPassword = await bcrypt.hash("password123", 10);

    // 1. Create New Doctors with different specialties
    const doctorData = [
      {
        name: "Dr. Hassan Raza",
        email: "hassan.raza@hospital.com",
        specialization: "Orthopedics & Bone Joint Specialist",
        department: "Orthopedics",
        phone: "+92 300 1234567",
      },
      {
        name: "Dr. Ayesha Malik",
        email: "ayesha.malik@hospital.com",
        specialization: "Pediatrics & Child Specialist",
        department: "Pediatrics",
        phone: "+92 301 7654321",
      },
    ];

    const createdDoctors = [];
    for (const d of doctorData) {
      let u = await User.findOne({ email: d.email });
      if (!u) {
        u = await User.create({
          name: d.name,
          email: d.email,
          password: defaultPassword,
          role: "doctor",
          phone: d.phone,
        });
        await Doctor.create({
          userId: u._id,
          specialization: d.specialization,
          department: d.department,
          availability: {
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            timeSlots: ["09:00 AM - 01:00 PM", "03:00 PM - 07:00 PM"],
          },
        });
        createdDoctors.push(d.name);
      }
    }

    // 2. Create New Patients
    const patientData = [
      {
        name: "Usman Khan",
        email: "usman.khan@gmail.com",
        phone: "+92 321 9876543",
        dob: "1994-08-12",
        gender: "Male",
        address: "House 45, Street 12, F-8, Islamabad",
      },
      {
        name: "Zainab Fatima",
        email: "zainab.fatima@gmail.com",
        phone: "+92 333 4567890",
        dob: "1998-11-25",
        gender: "Female",
        address: "Apartment 7B, Blue Area, Islamabad",
      },
    ];

    const createdPatients = [];
    for (const p of patientData) {
      let u = await User.findOne({ email: p.email });
      if (!u) {
        u = await User.create({
          name: p.name,
          email: p.email,
          password: defaultPassword,
          role: "patient",
          phone: p.phone,
        });
        await Patient.create({
          userId: u._id,
          dateOfBirth: p.dob,
          gender: p.gender,
          address: p.address,
          emergencyContact: {
            name: "Family Member",
            phone: p.phone,
            relationship: "Relative",
          },
        });
        createdPatients.push(p.name);
      }
    }

    // 3. Add Medicines to Inventory
    const medicinesData = [
      {
        name: "Paracetamol 500mg",
        genericName: "Acetaminophen",
        category: "Painkillers",
        price: 5.5,
        stockQuantity: 250,
        lowStockThreshold: 30,
        dosageForm: "Tablet",
        expiryDate: "2027-12-31",
      },
      {
        name: "Ciprofloxacin 500mg",
        genericName: "Ciprofloxacin HCl",
        category: "Antibiotics",
        price: 22.0,
        stockQuantity: 8, // Low stock warning!
        lowStockThreshold: 15,
        dosageForm: "Tablet",
        expiryDate: "2026-10-15",
      },
      {
        name: "Omeprazole 20mg",
        genericName: "Omeprazole",
        category: "Gastrointestinal",
        price: 14.5,
        stockQuantity: 95,
        lowStockThreshold: 20,
        dosageForm: "Capsule",
        expiryDate: "2027-06-30",
      },
      {
        name: "Cetirizine 10mg",
        genericName: "Cetirizine Dihydrochloride",
        category: "Antihistamine",
        price: 8.0,
        stockQuantity: 180,
        lowStockThreshold: 25,
        dosageForm: "Tablet",
        expiryDate: "2028-01-15",
      },
      {
        name: "Insulin Glargine 100IU/ml",
        genericName: "Insulin Glargine",
        category: "Endocrinology / Diabetes",
        price: 45.0,
        stockQuantity: 12,
        lowStockThreshold: 10,
        dosageForm: "Injection",
        expiryDate: "2026-09-20",
      },
    ];

    const createdMedicines = [];
    for (const m of medicinesData) {
      let existingMed = await Medicine.findOne({ name: m.name });
      if (!existingMed) {
        await Medicine.create(m);
        createdMedicines.push(m.name);
      }
    }

    console.log("POPULATE_DATA_SUCCESS");
    console.log("New Doctors Created:", createdDoctors);
    console.log("New Patients Created:", createdPatients);
    console.log("New Medicines Added:", createdMedicines);
  } catch (err) {
    console.error("Error populating data:", err);
  } finally {
    await mongoose.disconnect();
  }
}

populateData();

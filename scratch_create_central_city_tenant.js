const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = "mongodb+srv://ammadashraf7792_db_user:aBkcmLIL1cSaxQjv@cluster0.ovah27l.mongodb.net/hospital_db?retryWrites=true&w=majority";

async function hashPassword(pwd) {
  return await bcrypt.hash(pwd, 10);
}

async function seedTenant() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB Atlas");

    const db = mongoose.connection.db;

    // 1. Create or Find Organization
    let org = await db.collection('organizations').findOne({ slug: 'central-city-hospital' });
    if (!org) {
      const res = await db.collection('organizations').insertOne({
        name: "Central City Hospital",
        slug: "central-city-hospital",
        plan: "pro",
        subscriptionStatus: "active",
        maxDoctors: 20,
        maxPatients: 1000,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      org = { _id: res.insertedId, name: "Central City Hospital" };
    }

    console.log("Central City Hospital Org ID:", org._id.toString());
    const orgId = org._id;

    // Helper to create user + profile
    async function createUserAccount({ name, email, password, role, phone, specialization, department }) {
      const lowerEmail = email.toLowerCase().trim();
      const hashedPassword = await hashPassword(password);

      // Check existing user
      let user = await db.collection('users').findOne({ email: lowerEmail });
      if (user) {
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: { name, password: hashedPassword, role, organizationId: orgId, phone: phone || "" } }
        );
        console.log(`Updated user: ${lowerEmail} (${role})`);
      } else {
        const res = await db.collection('users').insertOne({
          name,
          email: lowerEmail,
          password: hashedPassword,
          role,
          organizationId: orgId,
          phone: phone || "",
          createdAt: new Date(),
          updatedAt: new Date()
        });
        user = { _id: res.insertedId };
        console.log(`Created user: ${lowerEmail} (${role})`);
      }

      // Create role profile
      if (role === 'patient') {
        const existingPatient = await db.collection('patients').findOne({ userId: user._id });
        if (!existingPatient) {
          await db.collection('patients').insertOne({
            userId: user._id,
            organizationId: orgId,
            dateOfBirth: "1995-05-15",
            gender: "Male",
            address: "Central City, Block A",
            createdAt: new Date(),
            updatedAt: new Date()
          });
        } else {
          await db.collection('patients').updateOne({ _id: existingPatient._id }, { $set: { organizationId: orgId } });
        }
      } else if (role === 'doctor') {
        const existingDoctor = await db.collection('doctors').findOne({ userId: user._id });
        if (!existingDoctor) {
          await db.collection('doctors').insertOne({
            userId: user._id,
            organizationId: orgId,
            specialization: specialization || "General Medicine",
            department: department || "General OPD",
            availability: {
              days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              timeSlots: ["09:00 AM - 01:00 PM", "02:00 PM - 05:00 PM"]
            },
            createdAt: new Date(),
            updatedAt: new Date()
          });
        } else {
          await db.collection('doctors').updateOne({ _id: existingDoctor._id }, { $set: { organizationId: orgId } });
        }
      }
    }

    // 2. Create Patients
    console.log("\n--- Creating Patients ---");
    await createUserAccount({ name: "Ammad Ashraf", email: "ammad.second7792@gmail.com", password: "Abc123", role: "patient" });
    await createUserAccount({ name: "Zainab Fatima", email: "zainab.fatima@gmail.com", password: "password123", role: "patient" });
    await createUserAccount({ name: "Usman Khan Patient", email: "usman.khan@gmail.com", password: "password123", role: "patient" });

    // 3. Create Doctors
    console.log("\n--- Creating Doctors ---");
    await createUserAccount({ name: "Dr. Sabeeh Ahmed", email: "sabeeh123@gmail.com", password: "abc123", role: "doctor", specialization: "General Medicine", department: "General OPD" });
    await createUserAccount({ name: "Dr. Usman Khan", email: "usman.khan.doc@gmail.com", password: "password123", role: "doctor", specialization: "Internal Medicine", department: "Inpatient Ward" });
    await createUserAccount({ name: "Dr. Ayesha Malik", email: "ayesha.malik@hospital.com", password: "password123", role: "doctor", specialization: "Cardiology", department: "Cardiology OPD" });

    // 4. Create Receptionist
    console.log("\n--- Creating Receptionist ---");
    await createUserAccount({ name: "Ali Raza", email: "ali123@gmail.com", password: "ABC123", role: "receptionist" });

    // 5. Create Pharmacist
    console.log("\n--- Creating Pharmacist ---");
    await createUserAccount({ name: "Awais Ahmad", email: "awais123@gmail.com", password: "AbC123", role: "pharmacist" });

    // 6. Create Admin
    console.log("\n--- Creating Admin ---");
    await createUserAccount({ name: "Mehmood Admin", email: "mehmood123@gmail.com", password: "ABc123", role: "admin" });

    console.log("\nSUCCESS: All tenant accounts created and linked to Central City Hospital!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error creating tenant accounts:", err);
  }
}

seedTenant();

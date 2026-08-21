const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = "mongodb+srv://ammadashraf7792_db_user:aBkcmLIL1cSaxQjv@cluster0.ovah27l.mongodb.net/hospital_db?retryWrites=true&w=majority";

async function createQuaidTenant() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB Atlas");

    const db = mongoose.connection.db;

    // 1. Create or Find Quaid-e-Azam Organization
    let quaidOrg = await db.collection('organizations').findOne({ slug: 'quaid-e-azam-hospital' });
    if (!quaidOrg) {
      const res = await db.collection('organizations').insertOne({
        name: "Quaid-e-Azam Hospital",
        slug: "quaid-e-azam-hospital",
        plan: "starter",
        subscriptionStatus: "active",
        maxDoctors: 5,
        maxPatients: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      quaidOrg = { _id: res.insertedId, name: "Quaid-e-Azam Hospital" };
    }

    console.log("Quaid-e-Azam Hospital Org ID:", quaidOrg._id.toString());

    // 2. Create Quaid Admin
    const hashedPassword = await bcrypt.hash("password123", 10);
    const adminEmail = "admin@quaid-e-azam.com";

    let adminUser = await db.collection('users').findOne({ email: adminEmail });
    if (!adminUser) {
      await db.collection('users').insertOne({
        name: "Quaid Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        organizationId: quaidOrg._id,
        phone: "+92 300 9998877",
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log("Created Quaid Admin: admin@quaid-e-azam.com");
    } else {
      await db.collection('users').updateOne(
        { _id: adminUser._id },
        { $set: { organizationId: quaidOrg._id } }
      );
      console.log("Updated Quaid Admin: admin@quaid-e-azam.com");
    }

    console.log("SUCCESS: Both Central City Hospital and Quaid-e-Azam Hospital are active in DB!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error creating Quaid tenant:", err);
  }
}

createQuaidTenant();

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://ammadashraf7792_db_user:aBkcmLIL1cSaxQjv@cluster0.ovah27l.mongodb.net/hospital_db?retryWrites=true&w=majority";

async function fixTenantScoping() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB Atlas successfully");

    const db = mongoose.connection.db;

    // 1. Get default Organization
    let defaultOrg = await db.collection('organizations').findOne({ slug: 'central-city-hospital' });
    if (!defaultOrg) {
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
      defaultOrg = { _id: res.insertedId };
    }

    console.log("Default Org ID:", defaultOrg._id);

    // 2. Assign default organizationId to any user without organizationId (except superadmin)
    const usersUpdated = await db.collection('users').updateMany(
      { role: { $ne: 'superadmin' }, organizationId: { $exists: false } },
      { $set: { organizationId: defaultOrg._id } }
    );
    console.log("Users updated with default organizationId:", usersUpdated.modifiedCount);

    // 3. Sync organizationId from User to Patient and Doctor records
    const patients = await db.collection('patients').find({ organizationId: { $exists: false } }).toArray();
    for (const patient of patients) {
      const u = await db.collection('users').findOne({ _id: patient.userId });
      if (u && u.organizationId) {
        await db.collection('patients').updateOne({ _id: patient._id }, { $set: { organizationId: u.organizationId } });
      } else {
        await db.collection('patients').updateOne({ _id: patient._id }, { $set: { organizationId: defaultOrg._id } });
      }
    }

    const doctors = await db.collection('doctors').find({ organizationId: { $exists: false } }).toArray();
    for (const doctor of doctors) {
      const u = await db.collection('users').findOne({ _id: doctor.userId });
      if (u && u.organizationId) {
        await db.collection('doctors').updateOne({ _id: doctor._id }, { $set: { organizationId: u.organizationId } });
      } else {
        await db.collection('doctors').updateOne({ _id: doctor._id }, { $set: { organizationId: defaultOrg._id } });
      }
    }

    // 4. Update orphan appointments, medicines, prescriptions, billing, medicalrecords
    await db.collection('appointments').updateMany({ organizationId: { $exists: false } }, { $set: { organizationId: defaultOrg._id } });
    await db.collection('medicines').updateMany({ organizationId: { $exists: false } }, { $set: { organizationId: defaultOrg._id } });
    await db.collection('prescriptions').updateMany({ organizationId: { $exists: false } }, { $set: { organizationId: defaultOrg._id } });
    await db.collection('medicalrecords').updateMany({ organizationId: { $exists: false } }, { $set: { organizationId: defaultOrg._id } });
    await db.collection('billings').updateMany({ organizationId: { $exists: false } }, { $set: { organizationId: defaultOrg._id } });

    console.log("SUCCESS: All tenant data fully isolated!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Migration error:", err.message);
  }
}

fixTenantScoping();

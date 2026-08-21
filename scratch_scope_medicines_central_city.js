const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://ammadashraf7792_db_user:aBkcmLIL1cSaxQjv@cluster0.ovah27l.mongodb.net/hospital_db?retryWrites=true&w=majority";

async function scopeMedicinesToCentralCity() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB Atlas");

    const db = mongoose.connection.db;

    // 1. Find Central City Hospital Org
    const centralCityOrg = await db.collection('organizations').findOne({ slug: 'central-city-hospital' });
    if (!centralCityOrg) {
      console.error("Central City Hospital org not found!");
      await mongoose.disconnect();
      return;
    }

    console.log("Central City Hospital Org ID:", centralCityOrg._id.toString());

    // 2. Assign organizationId to all medicines
    const res = await db.collection('medicines').updateMany(
      {},
      { $set: { organizationId: centralCityOrg._id } }
    );

    console.log(`Successfully assigned ${res.modifiedCount} / ${res.matchedCount} medicines to Central City Hospital pharmacy inventory!`);

    const count = await db.collection('medicines').countDocuments({ organizationId: centralCityOrg._id });
    console.log(`Total medicines in Central City Hospital inventory: ${count}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error scoping medicines:", err);
  }
}

scopeMedicinesToCentralCity();

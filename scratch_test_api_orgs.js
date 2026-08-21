const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://ammadashraf7792_db_user:aBkcmLIL1cSaxQjv@cluster0.ovah27l.mongodb.net/hospital_db?retryWrites=true&w=majority";

async function testApiOrgs() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB Atlas");
  const db = mongoose.connection.db;

  const orgs = await db.collection('organizations').find({}).toArray();
  console.log("ALL ORGANIZATIONS IN DATABASE:");
  orgs.forEach((o, i) => console.log(`${i + 1}. ID: ${o._id} | Name: "${o.name}" | Slug: "${o.slug}"`));

  await mongoose.disconnect();
}

testApiOrgs().catch(console.error);

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://ammadashraf7792_db_user:aBkcmLIL1cSaxQjv@cluster0.ovah27l.mongodb.net/hospital_db?retryWrites=true&w=majority";

async function checkOrgs() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB Atlas");
  const db = mongoose.connection.db;

  const orgs = await db.collection('organizations').find({}).toArray();
  console.log("ORGANIZATIONS IN DB:", JSON.stringify(orgs, null, 2));

  await mongoose.disconnect();
}

checkOrgs().catch(console.error);

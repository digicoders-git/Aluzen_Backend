import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Admin from './models/admin.models.js';

dotenv.config();

const EMAIL = 'admin@aluzen.in';
const PASSWORD = 'Aluzen@2025';
const NAME = 'Aluzen Admin';

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('DB Connected');

  const existing = await Admin.findOne({ email: EMAIL });
  if (existing) {
    console.log('Admin already exists:', EMAIL);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(PASSWORD, 10);
  await Admin.create({ name: NAME, email: EMAIL, password: hashed });

  console.log('✅ Admin created successfully!');
  console.log('   Email   :', EMAIL);
  console.log('   Password:', PASSWORD);
  process.exit(0);
}

createAdmin().catch(err => { console.error(err); process.exit(1); });


import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from './src/models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://rodrigonplacido1:123123456456@nutriplanner.f4mjfxq.mongodb.net/nutriplanner?appName=NutriPlanner';

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB (Atlas)');

        const testEmail = `diagnostic_${Date.now()}@test.com`;
        console.log(`Using test email: ${testEmail}`);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // 1. Create Cliente
        const lastUser = await User.findOne().sort({ id: -1 });
        const id1 = lastUser ? lastUser.id + 1 : 1;

        console.log(`Creating Cliente with ID ${id1}...`);
        const u1 = new User({
            id: id1,
            nome: 'Diag Cliente',
            email: testEmail,
            senha: hashedPassword,
            tipo: { id: 1, name: 'cliente' }
        });
        await u1.save();
        console.log('u1 saved');

        // 2. Create Nutricionista with SAME EMAIL
        const id2 = id1 + 1;
        console.log(`Creating Nutri with ID ${id2} (Same Email)...`);
        const u2 = new User({
            id: id2,
            nome: 'Diag Nutri',
            email: testEmail,
            senha: hashedPassword,
            tipo: { id: 2, name: 'nutricionista' }
        });
        await u2.save();
        console.log('u2 saved (Scoped uniqueness success!)');

        // Cleanup
        await User.deleteMany({ email: testEmail });
        console.log('Cleanup done');

        mongoose.disconnect();
    } catch (error) {
        console.error('DIAGNOSTIC FAILED:', error);
        process.exit(1);
    }
};

run();

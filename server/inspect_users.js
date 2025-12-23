
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/User.js';

dotenv.config();

// URI do db.js
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://rodrigonplacido1:123123456456@nutriplanner.f4mjfxq.mongodb.net/nutriplanner?appName=NutriPlanner';

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB (Atlas)');

        const users = await User.find().lean();
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- _id: ${u._id}, id: ${u.id}, email: ${u.email}, tipo: ${u.tipo?.name}`);
        });

        mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

run();

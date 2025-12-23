import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import { User } from './src/models/User.js';

async function dropIndex() {
    await connectDB();
    try {
        await User.collection.dropIndex('email_1');
        console.log('✅ Index email_1 removido com sucesso.');
    } catch (error) {
        console.log('⚠️ Index email_1 não existe ou erro:', error.message);
    }
    process.exit();
}

dropIndex();

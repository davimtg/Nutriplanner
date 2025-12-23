
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://rodrigonplacido1:123123456456@nutriplanner.f4mjfxq.mongodb.net/nutriplanner?appName=NutriPlanner';

const run = async () => {
    try {
        await User.collection.dropIndex('email_1');
        console.log('Index email_1 removido com sucesso.');
    } catch (error) {
        console.log('Index email_1 não existe ou erro:', error.message);
    }
    process.exit();
}

const collection = mongoose.connection.collection('users');
const indexes = await collection.indexes();
console.log('Current Indexes:', JSON.stringify(indexes, null, 2));

for (const idx of indexes) {
    if (idx.unique && idx.name !== '_id_' && idx.name !== 'id_1') {
        console.log(`Dropping unique index: ${idx.name}`);
        await collection.dropIndex(idx.name);
        console.log(`Dropped ${idx.name}`);
    }
}

mongoose.disconnect();
run();

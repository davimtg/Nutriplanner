import { connectDB } from './src/config/db.js';
import { Alimento } from './src/models/Moldes.js';

async function run() {
    await connectDB();
    const alimento = await Alimento.findOne({});
    console.log(JSON.stringify(alimento, null, 2));
    process.exit(0);
}

run();

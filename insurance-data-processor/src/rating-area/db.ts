import { RatingAreaDataModel } from "./interface";
import { Debugger } from "debug";
import { MongoClient } from "mongodb";
import { chunk, ceil } from "lodash";
import cliProgress from 'cli-progress';

export async function loadDataIntoDb(address: string, data: RatingAreaDataModel[], logger: Debugger) {
    logger("Loading data into database");
    const client = await MongoClient.connect(address, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    });
    const db = client.db('Clinovations');
    const collection = db.collection('RatingArea');

    // resets the collection
    await collection.deleteMany({});

    // sets the indices
    await collection.createIndexes([
        { key: { state: 1, ratingAreaId: 1 }, name: 'id', unique: true },
    ]);

    const chunks = chunk(data, 10);
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(ceil(data.length / 10), 0);

    for (const chunk of chunks) {
        await collection.insertMany(chunk);
        progressBar.increment();
    }

    progressBar.stop();
    client.close();
} 
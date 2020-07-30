import { Injectable } from "../util/decorators/injectable.decorator";
import { Pool, spawn, Worker } from 'threads';
import { join } from "path";

@Injectable()
export class WorkerService {
    readonly threadPool: Pool<any>;

    constructor() {
        this.threadPool = Pool(() => spawn(new Worker(join(process.cwd(), "dist", "worker/worker"))));
    }
}
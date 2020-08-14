import { ModuleThread, Pool, spawn, Worker } from 'threads';
import { Injectable } from '../util/decorators/injectable.decorator';
import { Worker as PlanWorker } from './worker';

@Injectable()
export class WorkerService {
    readonly threadPool: Pool<ModuleThread<PlanWorker>>;

    constructor() {
        this.threadPool = Pool(() => spawn(new Worker('worker')));
    }
}

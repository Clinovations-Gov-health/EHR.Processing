import { expose } from "threads";
import { WorkerFunction } from "threads/dist/types/worker";
import { isMainThread } from "worker_threads";

class Worker implements Record<string, WorkerFunction> {
    [k: string]: WorkerFunction;
 
    try() {
        return 2;
    }
}

if (!isMainThread) {
    expose(new Worker());
}
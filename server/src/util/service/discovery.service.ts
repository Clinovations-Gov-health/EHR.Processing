import { Container, interfaces } from 'inversify';
import { join } from "path";
import { InjectionMetadataKey, InjectableDecoratorOptions } from '../decorators/injectable.decorator';

export class DiscoveryService extends Container {
    private readonly providerFiles = [
        "/plan/controller",
        "/util/service/config.service",
        "/util/service/mongo.service",
        "/worker/worker.service",
    ];

    constructor() {
        super();
        this.bind(DiscoveryService).toConstantValue(this);
    }

    /**
     * Dark magic to check if something is a class (or newable object).
     */
    private isNewable(elem: any): elem is interfaces.Newable<any> {
        try {
            new new Proxy(elem, { construct() { return {}; }});
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Discovers all injectables and binds them to the container. Also blocks until all async initializers declared for each dependency is executed.
     */
    async discover() {
        const asyncInitializers: Map<interfaces.ServiceIdentifier<any>, (instance: any) => Promise<void>> = new Map();

        await Promise.all(this.providerFiles.map(async provider => {
            const exports: Record<string, unknown> = await import(join(process.cwd(), "dist", provider));

            Object.values(exports).forEach(elem => {
                if (!this.isNewable(elem)) {
                    return;
                }

                const metadata: InjectableDecoratorOptions<typeof elem> | undefined = Reflect.getMetadata(InjectionMetadataKey, elem);
                if (metadata) {
                    this.bind(metadata.token).to(elem);
                    if (metadata.asyncInitialize) {
                        asyncInitializers.set(metadata.token, metadata.asyncInitialize);
                    }
                }
            });
        }));

        await Promise.all(Array.from(asyncInitializers.entries()).map(async ([token, initializer]) => {
            return await initializer(this.get(token));
        }));
    }
}
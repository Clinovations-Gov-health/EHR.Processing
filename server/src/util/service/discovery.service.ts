import { join } from "path";
import { mapValues } from 'lodash';
import { ProviderMetadataKey } from '../decorators/injectable.decorator';

export type Newable<T = unknown> = { new (...args: any[]): T };
export type InjectionToken<T = unknown> = string | symbol | Newable<T>;

export interface ValueProvider<T> {
    useValue: T;
}

export interface ClassProvider<T> {
    useClass: Newable<T>;
}

export interface FactoryProvider<T> {
    inject: InjectionToken[];
    useFactory: (...args: any[]) => T | Promise<T>;
}

export type Provider<T = unknown> = ValueProvider<T> | ClassProvider<T> | FactoryProvider<T>;

export class DiscoveryService {
    private readonly providerFiles = [
        "/plan/plan.controller",
        "/plan/plan.service",
        "/util/service/config.service",
        "/util/service/mongo.service",
        "/worker/worker.service",
    ];

    private providerMaps = new Map<InjectionToken, [Provider, string[]]>();
    private container = new Map<InjectionToken, unknown>();

    private isValueProvider<T>(provider: Provider<T>): provider is ValueProvider<T> {
        return "useValue" in provider;
    }

    private isClassProvider<T>(provider: Provider<T>): provider is ClassProvider<T> {
        return "useClass" in provider;
    }

    private isFactoryProvider<T>(provider: Provider<T>): provider is FactoryProvider<T> {
        return "useFactory" in provider;
    }

    constructor() {
        this.register(DiscoveryService, { useValue: this });
    }

    register<T>(token: InjectionToken<T>, provider: Provider<T>, ...tags: string[]) {
        this.providerMaps.set(token, [provider, tags]);
    }

    async initialize() {
        const records = new Map(Array.from(this.providerMaps).map<[InjectionToken, boolean]>(([token]) => [token, false]));

        for (const token of this.providerMaps.keys()) {
            if (records.has(token)) {
                continue;
            }

            
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
                if (Reflect.hasMetadata(ProviderMetadataKey, elem as any)) {
                    const metadata: 
                }

                const metadata: InjectableDecoratorOptions<typeof elem> | undefined = Reflect.getMetadata(ProviderMetadataKey, elem);
                if (metadata) {
                    this.bind(metadata.token).to(elem);
                    if (metadata.asyncInitialize) {
                        asyncInitializers.set(metadata.token, metadata.asyncInitialize);
                    }
                }
            });
        }));
    }
}
import { InjectionToken, Newable, Provider } from "../service/discovery.service";
import { InjectionMetadataKey } from "./inject.decorator";

export const ProviderMetadataKey = Symbol("DI:Provider");

export interface ProviderMetadata<T> {
    token: InjectionToken<T>;
    provider: Provider<T>;
}

export const Injectable = <T>(token?: InjectionToken<T>, asyncInitializer?: (target: T) => Promise<void>) => (target: Newable<T>) => {
    let provider: Provider<T>;
    if (!asyncInitializer) {
        provider = { useClass: target };
    } else {
        const properties = Reflect.hasMetadata(InjectionMetadataKey, target) ? 
    }

    const metadata: ProviderMetadata<T> = {
        token: token ?? target,
        provide: asyncInitializer
            ? 
    }

    Reflect.defineMetadata(ProviderMetadataKey, { token: token ?? target }, target);
};
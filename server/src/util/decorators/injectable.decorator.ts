import { injectable, interfaces } from "inversify";

export const InjectionMetadataKey = "DI:InjectionMetadata";

export interface InjectableDecoratorOptions<T> {
    token: interfaces.ServiceIdentifier<T>;
    asyncInitialize?: (instance: T) => Promise<void>;
}

export const Injectable = <T>(token?: interfaces.ServiceIdentifier<any>, asyncInitialize?: (instance: T) => Promise<void>) => (target: interfaces.Newable<T>) => {
    Reflect.defineMetadata(InjectionMetadataKey, {
        token: token ?? target,
        asyncInitialize,
    }, target);

    return injectable()(target);
};
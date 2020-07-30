import { provide } from "inversify-binding-decorators";

export const Controller: (options: { route: string }) => ClassDecorator = options => constructor => {
    Reflect.defineMetadata("route", options.route, constructor);
    return provide("Controller")(constructor);
}


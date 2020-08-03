import fastify, { RouteOptions } from 'fastify';
import compress from 'fastify-compress';
import cors from 'fastify-cors';
import favicon from 'fastify-favicon';
import helmet from 'fastify-helmet';
import rateLimit from 'fastify-rate-limit';
import sensible from 'fastify-sensible';
import fs from 'fs';
import { SecureServerOptions, Http2SecureServer } from 'http2';
import "reflect-metadata";
import { ephemeral } from 'tls-keygen';
import { DiscoveryService } from './util/service/discovery.service';

async function main() {
    const prodMode = process.env.NODE_ENV === "production";

    const tlsOptions: SecureServerOptions = prodMode
        ? {
            key: fs.readFileSync('./cert/key.pem'),
            cert: fs.readFileSync('./cert/cert.pem'),
            ca: [fs.readFileSync('./cert/ca.ca-bundle')],
            allowHTTP1: true,
        } : {
            ...await ephemeral({ entrust: false }),
            allowHTTP1: true,
        };

    const instance = fastify({
        trustProxy: true,
        https: tlsOptions,
        maxParamLength: 500,
        http2: true,
    });

    // Middleware setup
    instance.register(sensible);
    instance.register(cors);
    instance.register(helmet);
    instance.register(compress);
    instance.register(favicon, { path: "favicon.jpg" });
    instance.register(rateLimit, { max: 2, timeWindow: 1500 });

    const discoveryService = new DiscoveryService();
    discoveryService.bind("Fastify").toConstantValue(instance);
    await discoveryService.discover();

    // Discover & setup all routes and providers
    discoveryService.getAll<Object>("Controller").forEach(controller => {
        const routes: RouteOptions<Http2SecureServer>[] = Reflect.getMetadata("routes", controller.constructor);
        routes.forEach(route => {
            instance.route(route);
        })
    });

    await instance.listen(3000);
}

main();
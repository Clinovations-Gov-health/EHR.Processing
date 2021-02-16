import loggerFactory from 'debug';
import fastify, { RouteOptions } from 'fastify';
import compress from 'fastify-compress';
import cors from 'fastify-cors';
import favicon from 'fastify-favicon';
import helmet from 'fastify-helmet';
import rateLimit from 'fastify-rate-limit';
import sensible from 'fastify-sensible';
import fs from 'fs';
import { Http2SecureServer, SecureServerOptions } from 'http2';
import "reflect-metadata";
import { ephemeral } from 'tls-keygen';
import { DiscoveryService } from './util/service/discovery.service';

async function main() {
    const prodMode = process.env.NODE_ENV === "production";
    const PORT: any = process.env.PORT||4000;

    /*
    const tlsOptions: SecureServerOptions = prodMode
        ? {
            key: fs.readFileSync('./cert/key.pem'),
            cert: fs.readFileSync('./cert/cert.pem'),
            ca: [fs.readFileSync('./cert/ca.ca-bundle')],
            allowHTTP1: true,
        } : {
            ...await ephemeral({ entrust: false }),
            allowHTTP1: true,
        }; */

    const instance = fastify({
        trustProxy: true,
        // https: tlsOptions,
        maxParamLength: 500,
        // http2: true,
    });

    // Middleware setup
    instance.register(sensible);
    instance.register(cors, { origin: '*' });
    instance.register(helmet);
    instance.register(compress);
    instance.register(favicon, { path: "favicon.jpg" });
    instance.register(rateLimit, { max: 2, timeWindow: 1500 });

    const discoveryService = new DiscoveryService();
    const logger = loggerFactory("main");
    discoveryService.register("Logger", { useValue: logger });
    discoveryService.register("Fastify", { useValue: instance });
    await discoveryService.discover();
    await discoveryService.initialize();

    // Discover & setup all routes and providers.
    discoveryService.getByTag("Controller").forEach(controller => {
        const routes: RouteOptions[] = Reflect.getMetadata("routes", controller.constructor);
        routes.forEach(route => {
            instance.route({
                ...route,
                handler: (req, res) => controller[route.handler.name](req, res),
            });
        })
    });

    logger("Initialization complete.");
    //await instance.listen(4000);
    
    try{
         await instance.listen(PORT,'0.0.0.0', (err) => {
             if (err) {
                console.log(`server listening on error:==>[` + err + "]");
             throw err;
             } else {
                //console.log(`server listening on ${instance.server.address().port}`);
                console.log(`server listening on ${instance.server.address()}`);
             }
            
            }); 
         console.log("attempting to listen on port " + PORT); 
        }catch(err)
         {
             console.log("error listening on port" + PORT);
         }
    
    
    
}

main();
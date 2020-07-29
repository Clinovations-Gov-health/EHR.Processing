import fastify from 'fastify';
import compress from 'fastify-compress';
import cors from 'fastify-cors';
import { bootstrap } from 'fastify-decorators';
import favicon from 'fastify-favicon';
import helmet from 'fastify-helmet';
import rateLimit from 'fastify-rate-limit';
import fs from 'fs';
import { SecureServerOptions } from 'http2';
import { ephemeral } from 'tls-keygen';

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

    instance.register(bootstrap, { directory: __dirname, mask: /.*controller.*/, skipBroken: true });
    instance.register(cors);
    instance.register(helmet);
    instance.register(compress);
    instance.register(favicon, { path: "favicon.jpg" });
    instance.register(rateLimit, { max: 2, timeWindow: 1500 });

    await instance.listen(3000);
}

main();
// this file contains configurations for dev proxy

const DEV_PROTOCOL = "http";
const DEV_HOST = "localhost:8081";

module.exports = {
    '/rest': {
        target: "https://dev.mapstore.geo-solutions.it/mapstore",
        secure: false,
        headers: {
            host: "dev.mapstore.geo-solutions.it"
        }
    },
    '/pdf': {
        target: "https://dev.mapstore.geo-solutions.it/mapstore",
        secure: false,
        headers: {
            host: "dev.mapstore.geo-solutions.it"
        }
    },
    '/mapstore/pdf': {
        target: "https://dev.mapstore.geo-solutions.it",
        secure: false,
        headers: {
            host: "dev.mapstore.geo-solutions.it"
        }
    },
    '/proxy': {
        target: "http://localhost:8081/",
        secure: false,
        headers: {
            host: "192.168.1.254"
        }
    }/*,
    '/docs': {
        target: "http://localhost:8081",
        pathRewrite: {'/docs': '/mapstore/docs'}
    },
    '/pluievolution': {
        target: "http://localhost:8082",
        pathRewrite: {'/pluievolution': '/'},
        headers: {
            host: "localhost"
        }   
    }*/
};
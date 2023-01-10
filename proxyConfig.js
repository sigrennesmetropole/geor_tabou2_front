// this file contains configurations for dev proxy
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
            host: "192.168.56.1"
        }
    },
    '/tabou2': {
        target: "https://portail-test.sig.rennesmetropole.fr",
        secure: false,
        headers: {
            host: "portail-test.sig.rennesmetropole.fr"
        }
    }
};

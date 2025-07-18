// Creating a new resolver uses the default server settings.
// Setting the servers used for a resolver using resolver.setServers() does not affect other resolvers:
const { Resolver } = require('node:dns');
const resolver = new Resolver();

// Returns an array of IP address strings, formatted according to RFC 5952, that are currently configured for DNS resolution.
// A string will include a port section if a custom port is used.
const servers = resolver.getServers();

servers.forEach(server => {
    console.log(`server: ${server}`);
});
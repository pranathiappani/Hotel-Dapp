module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545, // Ganache default port
      network_id: "1337", // Match any network id
    },
  },
  compilers: {
    solc: {
      version: "0.8.0", // Fetch exact version from solc-bin
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};
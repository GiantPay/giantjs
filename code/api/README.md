Giantjs is the Giant Contracts Development Kit, which means a development environment and testing framework for Giant Contracts.
With **Giantjs**, you get:

* Built-in smart contract compilation, linking and deployment management.
* Automated contract testing with Mocha and Chai.
* Configurable build pipeline with support for custom build processes.
* Scriptable deployment & migrations framework.
* Network management for deploying to many public & private networks.
* Interactive console for direct contract communication.
* Instant rebuilding of assets during development.
* External script runner that executes scripts within a **Giantjs** environment.

### Install

```
$ npm install -g gcdk
```

### Quick Usage

For a default set of contracts and tests, run the following within an empty project directory:

```
$ giantjs init
```

From there, you can run `giantjs compile`, `giantjs migrate` and `giantjs test` to compile your contracts, deploy those contracts to the network, and run their associated unit tests.

**Giantjs** comes bundled with a local development blockchain server that launches automatically when you invoke the commands above.

### Documentation

The basic ideas on which the work of **Giantjs** is based are described in [Giant Contracts White Paper](https://giantpay.network/whitepaper/contracts)

Please see the [Official Giantjs Documentation](https://github.com/GiantPay/giantjs/wiki) for guides, tips, and examples.

### Development

We welcome pull requests. To get started, just fork this repo, clone it locally, and run:

```shell
# Install
npm install -g yarn
yarn

# Test
npm test
```

### License

MIT

import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "acala lottery subql",
  description:
    "",
  runner: {
    node: {
      name: "@subql/node-ethereum",
      version: ">=3.0.0",
    },
    query: {
      name: "@subql/query",
      version: "*",
    },
  },
  schema: {
    file: "./schema.graphql",
  },
  network: {
    chainId: "595",
    // chainId: "787",
    // endpoint: [ "https://eth-rpc-acala.aca-api.network" ],
    endpoint: [ "https://eth-rpc-tc9.aca-staging.network" ],
    // dictionary: "https://gx.api.subquery.network/sq/subquery/eth-dictionary",
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 1770230,
      options: {
        // Must be a key of assets
        abi: "lotteryAbi",
        address: "0x104d8015F8478d145aeDD167cB76A8bB3B06078D",
      },
      assets: new Map([["lotteryAbi", { file: "./abis/Lottery.json" }]]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleDraw",
            filter: {
              topics: ["LotteryDraw(address,uint256,uint256,uint256[])"],
            },
          },
        ],
      },
    },
  ],
  repository: "https://github.com/subquery/ethereum-subql-starter",
};

// Must set default to the project instance
export default project;

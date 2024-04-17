import '@nomicfoundation/hardhat-toolbox';
import { HardhatUserConfig } from 'hardhat/config';
import dotenv from 'dotenv';

dotenv.config();

const TEST_ACCOUNTS = {
  mnemonic: 'fox sight canyon orphan hotel grow hedgehog build bless august weather swarm',
  path: 'm/44\'/60\'/0\'/0',
};

const PROD_ACCOUNTS = process.env.KEY ? [process.env.KEY] : [];

const config: HardhatUserConfig = {
  solidity: '0.8.24',
  networks: {
    local: {
      url: 'http://localhost:8545',
      accounts: TEST_ACCOUNTS,
      chainId: 595,
    },
    mandala: {
      url: 'https://eth-rpc-tc9.aca-staging.network',
      accounts: TEST_ACCOUNTS,
      chainId: 595,
    },
    karuraTestnet: {
      url: 'https://eth-rpc-karura-testnet.aca-staging.network',
      accounts: TEST_ACCOUNTS,
      chainId: 596,
    },
    acalaFork: {
      url: 'https://crosschain-dev.polkawallet.io/forkAcala/',
      accounts: TEST_ACCOUNTS,
      chainId: 787,
    },
    karura: {
      url: 'https://eth-rpc-karura.aca-api.network',
      accounts: PROD_ACCOUNTS,
      chainId: 686,
    },
    acala: {
      url: 'https://eth-rpc-acala.aca-api.network',
      accounts: PROD_ACCOUNTS,
      chainId: 787,
    },
  },
  mocha: {
    timeout: 600000, // 10 min
  },
  etherscan: {
    apiKey: {
      mandala: 'no-api-key-needed',
      karuraTestnet: 'no-api-key-needed',
      acalaTestnet: 'no-api-key-needed',
      karura: 'no-api-key-needed',
      acala: 'no-api-key-needed',
    },
    customChains: [
      {
        network: 'mandala',
        chainId: 595,
        urls: {
          apiURL: 'https://blockscout.mandala.aca-staging.network//api',
          browserURL: 'https://blockscout.mandala.aca-staging.network/',
        },
      },
      {
        network: 'karuraTestnet',
        chainId: 596,
        urls: {
          apiURL: 'https://blockscout.karura-testnet.aca-staging.network/api',
          browserURL: 'https://blockscout.karura-testnet.aca-staging.network',
        },
      },
      {
        network: 'acalaTestnet',
        chainId: 597,
        urls: {
          apiURL: 'https://blockscout.acala-dev.aca-dev.network/api',
          browserURL: 'https://blockscout.acala-dev.aca-dev.network',
        },
      },
      {
        network: 'karura',
        chainId: 686,
        urls: {
          apiURL: 'https://blockscout.karura.network/api',
          browserURL: 'https://blockscout.karura.network',
        },
      },
      {
        network: 'acala',
        chainId: 787,
        urls: {
          apiURL: 'https://blockscout.acala.network/api',
          browserURL: 'https://blockscout.acala.network',
        },
      },
    ],
  },
};

export default config;
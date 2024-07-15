# solana-cli

solana cli for nodejs

### Install

```bash
npm install solana-cli -g
```

## Usage

```shell
# Import solana account private key
export SOLANA_PRIVATE_KEY=${your_account_private_key}

# set solana network: devnet|testnet|mainnet-beta
export SOLANA_NETWORK=${network}
```

```shell
Usage: solana-cli [options] [command]

CLI to solana wallet

Options:
  -v, --version             output the current version
  -h, --help                display help for command

Commands:
  wallet                    Display the current environment wallet public key address
  createWallet              Create a new wallet keypair(The newly created wallet cannot be used. You need to execute 'export SOLANA_PRIVATE_KEY=${your private key string}'
                            first.)
  getEndpoint               Return current connection provider endpoint
  getSlot [options]         Fetch the slot that has reached the given or default commitment level, call rpc.getSlot()
  getRecentBlock [options]  Fetch the latest blockhash from the cluster
  getTransaction [options]  Fetch parsed transaction details for a confirmed or finalized transaction
  getBalance [options]      Fetch the balance for the specified public key
  transfer [options]        Transfer sol to the destination address
  token [options]           CLI to solana token tools, First you must set the private key to the environment variable SOLANA_PRIVATE=${Your private key}
  help [command]            display help for command
  
```

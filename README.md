* [solana-cli](#solana-cli)
    * [Install](#Install)
    * [Environment variable settings](#Environment-variable-settings)
    * [Commands](#Commands)
        * [Create wallet](#Create-wallet)
        * [Current wallet](#Current-wallet)
        * [Network](#Network)
        * [Airdrop](#Airdrop)
        * [GetSlot](#GetSlot)
        * [GetRecentBlock](#GetRecentBlock)
        * [GetTransaction](#GetTransaction)
        * [GetBalance](#GetBalance)
        * [Transfer](#Transfer)
    * [SubCommands [Token]](#SubCommands)
        * [Deploy SPL-Token](#Deploy-SPL-Token)
        * [SPL-Token Info](#SPL-Token-Info)
        * [Mint SPL-Token](#Mint-SPL-Token)
        * [SPL-Token Balance](#SPL-Token-Balance)
        * [SPL-Token Transfer](#SPL-Token-Transfer)
        * [Update SPL-Token authorize](#Update-SPL-Token-authorize)
        * [Update SPL-Token metadata](#Update-SPL-Token-metadata)

# solana-cli

**solana cli for nodejs**

Support SOL transfer balance query and SPL-TOKEN create, mint, transfer, metadata update, authorize update. Support metaplex token metedata account

### Install

```bash
npm install solana-cli -g
```

## Environment variable settings

```shell
# Import solana account private key
export SOLANA_PRIVATE_KEY=${your_account_private_key}

# set solana network: devnet|testnet|mainnet-beta
export SOLANA_NETWORK=${network}
```

## Commands
### Wallet
#### Create wallet
Generate a new wallet public and private key pair
```shell
solana-cli createWallet
```
Output
```shell
{
  privateKey: '3YcgCAMhihf2FACfUi2Ska3oQ3Bz8g5asmyEEHdyw9AdGqSZjiXi2bsx1dXLFXEGfkSzPvHcRZnetHp1VuPK8hMs',
  publicKey: 'AoNWGW75xhuMxmv6ByR1NWfgugN8bZaAgY3Lhx4UNh7',
  address: 'AoNWGW75xhuMxmv6ByR1NWfgugN8bZaAgY3Lhx4UNh7'
}
```

#### Current wallet
Display the wallet address and public key used in the current environment
```shell
solana-cli wallet
```
Output
```shell
{
  publicKey: '2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c',
  address: '2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c'
}
```

#### Network
Return current network connection provider endpoint
```shell
solana-cli endpoint
```
Output
```shell
https://api.devnet.solana.com
```

#### Airdrop
Request SOL from a faucet (Support devnet and testnet)

Usage
```shell
Usage: solana-cli airdrop [options]
Options:
  -d, --destination <string>  Account of airdrop recipient
  -a, --amount <number>       The airdrop amount to request, in SOL (default: 1)
  -h, --help                  display help for command

```
Example
```shell
solana-cli airdrop -d 2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c
```
Output
```shell
- Start send airdrop 1 SOL to 2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c transaction .....
- Send airdrop 1 SOL to 2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c transaction successful. hash="262xhTkfTsXw1N6R3cn6BPfeN84i7per4BGSQSXYvTe3j5HnAByejABiaRVct6ZP4V92w243r82obHvh78xSyPiq"
```

#### GetSlot
Fetch the slot that has reached the given or default commitment level, call rpc.getSlot()
```shell
solana-cli slot
```
Output
```shell
333533488
```

#### GetRecentBlock
Fetch the latest blockhash from the cluster
```shell
solana-cli recentBlock
```
Output
```shell
{
  blockHash: '5Jad67Tugvt1QFnh797GiD5PeZMFdKdoCHEC4d6MxR2v',
  blockNumber: 333533635
}
```

#### GetTransaction
Fetch parsed transaction details for a confirmed or finalized transaction
```shell
solana-cli transaction -hash 5Dx8utXK8W6Z1hnmrE9HmB4Xft6FPdSxXkAE8QKay7jVMr1ptbFBUpDsuYogdJi256dAF9ncDFqpYAdoseRXi7fD
```
Output
```shell
{
    "blockTime": 1729157369,
    "meta": {...},
    "transaction": {....}
}
```

#### GetBalance
Fetch the SOL balance for the specified public key
```shell
solana-cli balance -a 2sFWRzFKaCRLH88yDNtKdSxnrksYr148qeaG2Gw6HUsW
```
Output
```shell
{
    "amount": 1992559560,
    "uiAmount": 1.99255956
}
```

#### Transfer
Transfer SOL from the current wallet to the specified destination address

Usage
```shell
Usage: solana-cli transfer [options]
Options:
  -d, --destination <string>  Account that will receive transferred sol
  -a, --amount <number>       Amount to transfer
  -c, --commitment <string>   Configuring State Commitment, values of(finalized | confirmed | processed) (default: "finalized")
  -h, --help                  display help for command
```
Example
```shell
solana-cli transfer -d 6cMTwC6QvwgMHv8nbyeTsobvmMxFHFe4343RMutQdUQU -a 0.1
```
Output
```shell
- Start building transfer SOL transaction ....
+ Transfer 0.1 SOL transaction send successful. hash="5yce6Pe7yhKo5YeLq9Q88zbYkKS8ct2iZiZ9QaJLZ6WqBUjD2CFtGE6q6skPmNLAYPicKMi6MwyHiDt9fbn35z8H".
```

## SubCommands
### SPL-Token
```shell
solana-cli token [options] [command]
Commands:
  info [options]        Get solana SPL-TOKEN information
  deploy [options]      Deploy new solana SPL-TOKEN
  mint [options]        Mint solana SPL-TOKEN amount
  getBalance [options]  Fetch parsed token accounts owned by the specified account
  transfer [options]    Transfer spl token to the destination address
  authorize [options]   Set spl token authority to new account
  update [options]      Update spl token metadata
  help [command]        display help for command
```

#### Deploy SPL-Token
Create and mint new solana SPL-Token. If the ata account of the target address does not exist, it will be automatically created without the need to create it separately

Usage
```shell
solana-cli token deploy [options]
Options:
  -n, --name <string>             Token name
  -s, --symbol <string>           Token symbol
  -u, --uri <string>              Token URI
  -d, --decimals <number>         Token decimals
  -a, --amount <number>           First supply amount
  -m, --metadataAccount <string>  Whether to create metadataAccount, if not, use extension (only valid for TOKEN_2022_PROGRAM_ID)
  -p, --programId <string>        SPL-TOKEN programId version, values of (TOKEN || TOKEN_2022)
  -h, --help                      display help for command
```
Example
```shell
solana-cli token deploy -n "Test Token" -s "TT" -u "https://arweave.net/7BzVsHRrEH0ldNOCCM4_E00BiAYuJP_EQiqvcEYz3YY" -d 8 -a 1000000 -m "YES" -p TOKEN
```
Output
```shell
- Start build create token transaction....
- Start sending create token transaction....
+ Create token send successful. hash="2z4SG6EQPga99nNzhRtaKANLZvN4LveGftCGdQjgchvGSrjaK4ebLDnTu2GD2t7JWBTP9DR5UnMp1f9pCwLHJnU9", mint="nxpgh68Kkz67oabxTY74z4JvC4hKrZnKYq2FtpCDGUT"

- Start building mint token transaction.....
{
  payer: '2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c',
  mint: 'nxpgh68Kkz67oabxTY74z4JvC4hKrZnKYq2FtpCDGUT',
  destination: '2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c',
  amount: '1000000',
  programIdVersion: 'TOKEN'
}
- Generate associated token account by owner destination="2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c"
+ Destination="2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c" associated token account created at "BZ7hD9b5CfW11wgwhR1iCDXshNaFodCPtXoMTzHtThry"
- Start fetch destination associated token account "BZ7hD9b5CfW11wgwhR1iCDXshNaFodCPtXoMTzHtThry"
+ Destination associated token account not found, create associated token account instruction....
- Create mint to instruction....
- Start send mint token transaction....
+ Mint token transaction send successful. hash="3tHcqWfWtaGNduKDo99vpDQPxoBHqTNxKZEy4NtUfjeQifcGAcKVDnvZUikpVXjJbxJ6tF3x9GNfBdkDRDPfwud7".
Token info create and mint success, details:
{
  tokenName: 'Test Token',
  tokenSymbol: 'TT',
  tokenUri: 'https://arweave.net/7BzVsHRrEH0ldNOCCM4_E00BiAYuJP_EQiqvcEYz3YY',
  tokenAddress: 'nxpgh68Kkz67oabxTY74z4JvC4hKrZnKYq2FtpCDGUT',
  tokenDecimals: '8',
  totalSupply: '1000000',
  programIdVersion: 'TOKEN',
  programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  sender: '2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c',
  createMintHash: '2z4SG6EQPga99nNzhRtaKANLZvN4LveGftCGdQjgchvGSrjaK4ebLDnTu2GD2t7JWBTP9DR5UnMp1f9pCwLHJnU9',
  mintTokenHash: '3tHcqWfWtaGNduKDo99vpDQPxoBHqTNxKZEy4NtUfjeQifcGAcKVDnvZUikpVXjJbxJ6tF3x9GNfBdkDRDPfwud7'
}
```

**--metadataAccount <string>  Whether to create metadataAccount, if not, use extension (only valid for TOKEN_2022_PROGRAM_ID)**


#### SPL-Token Info
Get solana SPL-TOKEN information
```shell
solana-cli token info -m nxpgh68Kkz67oabxTY74z4JvC4hKrZnKYq2FtpCDGUT -p TOKEN
```
Output
```shell
{
  address: 'nxpgh68Kkz67oabxTY74z4JvC4hKrZnKYq2FtpCDGUT',
  name: 'Test Token',
  symbol: 'TT',
  uri: 'https://arweave.net/7BzVsHRrEH0ldNOCCM4_E00BiAYuJP_EQiqvcEYz3YY',
  isMutable: true,
  updateAuthority: '2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c',
  metaplex: true,
  metadataAccount: 'Av6TsjYDgodgCUVV7nmeYCYGnWszRq7Tf77HTH9TmCH3',
  decimals: 8,
  totalSupply: '1000000',
  mintAuthority: '2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c',
  freezeAuthority: '2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c'
}
```

#### Mint SPL-Token
Mint solana SPL-TOKEN amount, If the ata account of the target address does not exist, it will be automatically created without the need to create it separately

Usage
```shell
solana-cli token mint [options]
Options:
  -m, --mint <string>         Mint for the account
  -d, --destination <string>  Address of the account to mint to
  -a, --amount <number>       Amount to mint
  -p, --programId <string>    SPL-TOKEN programId version, values of (TOKEN || TOKEN_2022)
  -h, --help                  display help for command
```
Example
```shell
solana-cli token mint -m nxpgh68Kkz67oabxTY74z4JvC4hKrZnKYq2FtpCDGUT -d 2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c -a 20000 -p TOKEN
```
Output
```shell
- Start building mint token transaction.....
{
  payer: '2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c',
  mint: 'nxpgh68Kkz67oabxTY74z4JvC4hKrZnKYq2FtpCDGUT',
  destination: '2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c',
  amount: '20000',
  programIdVersion: 'TOKEN'
}
- Generate associated token account by owner destination="2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c"
+ Destination="2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c" associated token account created at "BZ7hD9b5CfW11wgwhR1iCDXshNaFodCPtXoMTzHtThry"
- Start fetch destination associated token account "BZ7hD9b5CfW11wgwhR1iCDXshNaFodCPtXoMTzHtThry"
+ Destination associated token account info :
{
  account: 'BZ7hD9b5CfW11wgwhR1iCDXshNaFodCPtXoMTzHtThry',
  mint: 'nxpgh68Kkz67oabxTY74z4JvC4hKrZnKYq2FtpCDGUT',
  owner: '2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c',
  amount: 100000000000000n,
  delegate: null,
  delegatedAmount: 0n,
  isInitialized: true,
  isFrozen: false,
  isNative: false,
  rentExemptReserve: null,
  closeAuthority: null,
  tlvData: <Buffer >
}
- Create mint to instruction....
- Start send mint token transaction....
+ Mint token transaction send successful. hash="5FvJFy5CPHCgpdAAeY4Pkkesi27jLvgQRYNVVUJ6vDY1qbkofuAUE2KBvZVQhsExQCKeA4hjb1T3yXfGiKGbZRPq".
```

#### SPL-Token Balance
Fetch parsed token accounts owned by the specified account

Usage
```shell
solana-cli token getBalance [options]
Options:
  -a, --address <string>     Address public key
  -m, --mint <string>        SPL-TOKEN account
  -p, --programId <string>   SPL-TOKEN programId version, values of (TOKEN || TOKEN_2022) (default: "TOKEN")
  -c, --commitment <string>  Configuring State Commitment, values of(finalized | confirmed | processed) (default: "finalized")
  -h, --help                 display help for command
```

Example
```shell
solana-cli token getBalance -m nxpgh68Kkz67oabxTY74z4JvC4hKrZnKYq2FtpCDGUT -a 2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c  -p TOKEN
```

Output
```shell
[
    {
        "address": "2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c",
        "account": "BZ7hD9b5CfW11wgwhR1iCDXshNaFodCPtXoMTzHtThry",
        "state": "initialized",
        "amount": "102000000000000",
        "uiAmount": "1020000",
        "token": "nxpgh68Kkz67oabxTY74z4JvC4hKrZnKYq2FtpCDGUT",
        "decimals": 8,
        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
    }
]
```
#### SPL-Token Transfer
Transfer spl token to the destination address. If the ata account of the target address does not exist, it will be automatically created without the need to create it separately

Usage
```shell
solana-cli token transfer [options]
Options:
  -m, --mint <string>         Mint for the account
  -d, --destination <string>  Account that will receive transferred token
  -a, --amount <number>       Amount to transfer
  -p, --programId <string>    SPL-TOKEN programId version, values of (TOKEN || TOKEN_2022)
  -c, --commitment <string>   Configuring State Commitment, values of(finalized | confirmed | processed) (default: "finalized")
  -h, --help                  display help for command
```

Example
```shell
 solana-cli token transfer -m nxpgh68Kkz67oabxTY74z4JvC4hKrZnKYq2FtpCDGUT -d 6cMTwC6QvwgMHv8nbyeTsobvmMxFHFe4343RMutQdUQU -a 100 -p TOKEN
```

Output
```shell
- Start building TT transfer transaction ....
+ Transfer 100 TT transaction send successful. hash="YkP25WMpZXsLPbXEWPH2FbodW3iu5kdyigqhymmXTxBg5UC46f47KRd854qUKZsHtVdvkJUK9691G5RBGiK9NUx".
```

#### Update SPL-Token authorize
Update spl token authority to new account

Usage
```shell
solana-cli token authorize [options]
Options:
  -m, --mint <string>          Mint for the account
  -a, --authorize <string>     Type of authority to set, values of (mint|freeze|update)
  -n, --newAuthority <number>  New authority of the account
  -p, --programId <string>     SPL-TOKEN programId version, values of (TOKEN || TOKEN_2022)
  -c, --commitment <string>    Configuring State Commitment, values of(finalized | confirmed | processed) (default: "finalized")
  -h, --help                   display help for command
```

Example (update freeze authorize)
```shell
solana-cli token authorize -m nxpgh68Kkz67oabxTY74z4JvC4hKrZnKYq2FtpCDGUT -a freeze -n 6cMTwC6QvwgMHv8nbyeTsobvmMxFHFe4343RMutQdUQU -p TOKEN
```

Output
```shell
- Start building set authority transaction ....
  Token=nxpgh68Kkz67oabxTY74z4JvC4hKrZnKYq2FtpCDGUT || authorityType=freeze || oldAuthority=2AZZJJghtv5HjYm9SiMGB6NAby8mMHBAr9qXfFVYE34c || newAuthority=6cMTwC6QvwgMHv8nbyeTsobvmMxFHFe4343RMutQdUQU
+ Set authority transaction send successful. hash="2dCuvW2waptP54DjWhQR3G7w9sTDd6JN9XRTwCkXBBD2dU4muGYcCpEZoKz6zSmcfo7HuwPMiF6xRscB5kPsFq7R".
```

#### Update SPL-Token metadata
Update spl token metadata field. support TOKEN_2022 extension and TOKEN Metaplex Metadata, The program will automatically recognize

Usage
```shell
solana-cli token update [options]
Options:
  -m, --mint <string>        Mint for the account
  -f, --field <string>       Field to update in the metadata (name|symbol|uri)
  -V, --value <number>        Value to write for the field
  -p, --programId <string>   SPL-TOKEN programId version, values of (TOKEN || TOKEN_2022)
  -c, --commitment <string>  Configuring State Commitment, values of(finalized | confirmed | processed) (default: "finalized")
  -h, --help                 display help for command
```

Example (update metadata 'symbol' field)
```shell
solana-cli token  update -m nxpgh68Kkz67oabxTY74z4JvC4hKrZnKYq2FtpCDGUT -f "symbol" -V "TTT" -p TOKEN
```

Output
```shell
- Start building update metadata field transaction ....
  Token=nxpgh68Kkz67oabxTY74z4JvC4hKrZnKYq2FtpCDGUT || Field=symbol || value=TTT
+ Update token metadata field transaction send successful. hash="2uqaMj1F44xnSfV3EwbuFHvP1DfzUAu4Vcy8TnAsSgP6wgkFfN4Dsb2fbRnymXKvinBRLjbgfEpwcpDCWUXFmemV".
```
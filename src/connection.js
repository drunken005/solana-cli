const etherUtils = require("@ethersproject/units");
const {
          Keypair,
          Connection: SolConnection,
          PublicKey,
          SystemProgram,
          Transaction,
          clusterApiUrl,
          sendAndConfirmTransaction,
      }          = require("@solana/web3.js");
const {
          createMint,
          getMint,
          getMintLen,
          getOrCreateAssociatedTokenAccount,
          getAccount,
          getTokenMetadata,
          mintTo,
          transfer,
          AccountLayout,
          TOKEN_PROGRAM_ID,
          TOKEN_2022_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TYPE_SIZE,
          LENGTH_SIZE,
          ExtensionType,
          createInitializeMint2Instruction,
          createAssociatedTokenAccountInstruction,
          createInitializeMetadataPointerInstruction,
          createMintToInstruction,
          TokenAccountNotFoundError,
          createTransferCheckedInstruction,
          createSetAuthorityInstruction,
          tokenMetadataUpdateAuthority,
      }          = require("@solana/spl-token");
const bs58       = require("bs58");

const {
          createInitializeInstruction,
          pack,
          createUpdateAuthorityInstruction,
      } = require("@solana/spl-token-metadata");

const DEFAULT_COMMITMENT = "finalized";

const TOKEN_PROGRAM_ID_MAPPING = {
    "TOKEN":      TOKEN_PROGRAM_ID,
    "TOKEN_2022": TOKEN_2022_PROGRAM_ID,
};

const AUTHORITY_TYPE = {
    mint:   0,
    freeze: 1,
    update: 12,
};

class Connection {

    static endpoint(network) {
        let endpoint = network;
        if (/^(devnet|testnet|mainnet-beta)$/.test(network)) {
            endpoint = clusterApiUrl(network);
        }
        // console.log({endpoint});
        return endpoint;
    }

    /**
     * Network name 'devnet' | 'testnet' | 'mainnet-beta'
     * @param network
     * @returns {Connection}
     */
    static provider(network) {
        let endpoint = this.endpoint(network);
        return new SolConnection(endpoint);
    }

    static async getSlot(connection, commitment = DEFAULT_COMMITMENT) {
        return await connection.getSlot(commitment);
    }

    static async getRecentBlock(connection, commitment = DEFAULT_COMMITMENT) {
        // Import: getRecentBlockhash 已经弃用使用 getLatestBlockhashAndContext
        // Import: 构建交易使用recentBlockhash 时 commitment必须是 "finalized"
        const latestBlock = await connection.getLatestBlockhashAndContext(commitment);
        return {
            blockHash:   latestBlock.value.blockhash,
            blockNumber: latestBlock.context.slot,
        };
    }

    static async getTransaction(connection, txHash, commitment = DEFAULT_COMMITMENT) {
        return await connection.getParsedTransaction(txHash, {
            commitment,
            maxSupportedTransactionVersion: 0,
        });
    }

    static async getBalance(connection, address, commitment = DEFAULT_COMMITMENT) {
        const balance = await connection.getBalance(new PublicKey(address), commitment);
        return {
            amount:   balance,
            uiAmount: Number(etherUtils.formatUnits(balance, 9)),
        };
    }

    static async getTokenBalance(connection, address, mint, programId, commitment = DEFAULT_COMMITMENT) {
        let filter = {};
        if (!!mint) {
            filter.mint = new PublicKey(mint);
        }
        if (!!programId) {
            filter.programId = TOKEN_PROGRAM_ID_MAPPING[programId];
        }
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            new PublicKey(address),
            filter,
            commitment,
        );
        return tokenAccounts.value.map((token) => {
            return {
                address:   token.account.data.parsed.info.owner,
                account:   token.pubkey,
                state:     token.account.data.parsed.info.state,
                amount:    token.account.data.parsed.info.tokenAmount.amount,
                uiAmount:  token.account.data.parsed.info.tokenAmount.uiAmountString,
                token:     token.account.data.parsed.info.mint,
                decimals:  token.account.data.parsed.info.tokenAmount.decimals,
                programId: token.account.owner,
            };
        });
    }

    static async getTokenSupply(connection, mint, commitment = DEFAULT_COMMITMENT) {
        const tokenInfo = await connection.getTokenSupply(new PublicKey(mint), commitment);
        return tokenInfo.value;
    }

    static async getTokenMetadata(connection, mint, commitment = DEFAULT_COMMITMENT, programIdVersion) {
        let programId     = TOKEN_PROGRAM_ID_MAPPING[programIdVersion];
        const tokenSupply = await this.getTokenSupply(connection, mint, commitment);
        const metadata    = await getTokenMetadata(connection, new PublicKey(mint), commitment, programId);
        return {
            address:            metadata.mint.toBase58(),
            name:               metadata.name,
            symbol:             metadata.symbol,
            decimals:           tokenSupply.decimals,
            totalSupply:        tokenSupply.uiAmountString,
            uri:                metadata.uri,
            additionalMetadata: metadata.additionalMetadata,
            updateAuthority:    metadata.updateAuthority.toBase58(),
        };
    }

    static async deployToken(connection, payerPrivateKey, name, symbol, uri, decimals, amount, programIdVersion) {
        const payer         = Keypair.fromSecretKey(new Uint8Array(bs58.decode(payerPrivateKey)));
        const {
                  hash: createMintHash,
                  mint,
              }             = await this.createMintAccount(connection, payerPrivateKey, name, symbol, uri, decimals, amount, programIdVersion);
        const mintTokenHash = await this.mintToken(connection, payerPrivateKey, mint, payer.publicKey.toBase58(), amount, programIdVersion);
        return {
            tokenName:     name,
            tokenSymbol:   symbol,
            tokenUri:      uri,
            tokenAddress:  mint,
            tokenDecimals: decimals,
            totalSupply:   amount,
            programIdVersion,
            programId:     TOKEN_PROGRAM_ID_MAPPING[programIdVersion].toBase58(),
            sender:        payer.publicKey.toBase58(),
            createMintHash,
            mintTokenHash,
        };
    }


    /**
     * Create SPL-TOKEN mint account
     * @param connection
     * @param payerPrivateKey
     * @param name
     * @param symbol
     * @param uri
     * @param decimals
     * @param amount
     * @param programIdVersion
     * @returns {Promise<{mint: string, hash: string}>}
     */
    static async createMintAccount(connection, payerPrivateKey, name, symbol, uri, decimals, amount, programIdVersion) {
        console.log(`- Start building createInitializeMint2Instruction transaction....`);
        let programId         = TOKEN_PROGRAM_ID_MAPPING[programIdVersion];
        const minter          = Keypair.fromSecretKey(new Uint8Array(bs58.decode(payerPrivateKey)));
        const mintKeypair     = Keypair.generate();
        const mint            = mintKeypair.publicKey.toBase58();
        const mintAuthority   = minter.publicKey;
        const freezeAuthority = minter.publicKey;
        const metadata        = {
            mint:               mintKeypair.publicKey,
            name:               name,
            symbol:             symbol,
            uri:                uri || "",
            additionalMetadata: [],
        };

        const mintLen = getMintLen([ExtensionType.MetadataPointer]);

        const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

        console.log(`Token metadata information:`);
        console.log(metadata);

        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey:       minter.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                space:            mintLen,
                lamports,
                programId,
            }),
            createInitializeMetadataPointerInstruction(mintKeypair.publicKey, minter.publicKey, mintKeypair.publicKey, programId),
            createInitializeMint2Instruction(mintKeypair.publicKey, decimals, mintAuthority, freezeAuthority, programId),
            createInitializeInstruction({
                programId,
                mint:            mintKeypair.publicKey,
                metadata:        mintKeypair.publicKey,
                name:            metadata.name,
                symbol:          metadata.symbol,
                uri:             metadata.uri,
                mintAuthority:   mintAuthority,
                updateAuthority: mintAuthority,
            }),
        );
        console.log({
            minter:    minter.publicKey.toBase58(),
            name,
            symbol,
            uri,
            decimals,
            amount,
            programIdVersion,
            programId: programId.toBase58(),
            mint,
        });
        console.log(`- Start sending createInitializeMint2Instruction transaction .....`);
        const hash = await sendAndConfirmTransaction(connection, transaction, [minter, mintKeypair], {commitment: DEFAULT_COMMITMENT});
        console.log(`+ CreateInitializeMint2Instruction send successful. hash="${hash}", mint="${mint}"\n`);
        return {
            hash,
            mint,
        };
    }

    /**
     * Mint tokens to an account
     * @param connection Connection to use
     * @param payerPrivateKey Payer of the transaction fees
     * @param mint Mint for the account (bas58 string)
     * @param destination Address of the account to mint to (bas58 string)
     * @param amount Amount to mint
     * @param programIdVersion SPL Token program account
     * @returns {Promise<string>}
     */
    static async mintToken(connection, payerPrivateKey, mint, destination, amount, programIdVersion) {
        console.log(`- Start building mint token transaction.....`);
        const payer      = Keypair.fromSecretKey(new Uint8Array(bs58.decode(payerPrivateKey)));
        let programId    = TOKEN_PROGRAM_ID_MAPPING[programIdVersion];
        const tokenInfo  = await this.getTokenSupply(connection, new PublicKey(mint));
        const mintAmount = etherUtils.parseUnits(amount.toString(), tokenInfo.decimals).toString();
        console.log({
            payer: payer.publicKey.toBase58(),
            mint,
            destination,
            amount,
            programIdVersion,
        });
        console.log(`- Generate associated token account by owner destination="${destination}"`);
        const destinationAccount = this.generateATAAddress(destination, mint, programId);
        console.log(`+ Destination="${destination}" associated token account created at "${destinationAccount}"`);
        const transaction = new Transaction();
        try {
            console.log(`- Start fetch destination associated token account "${destinationAccount}"`);
            const ataAccountInfo = await this.getAssociatedTokenAccount(connection, destinationAccount, programId);
            console.log(`+ Destination associated token account info :`);
            console.log(ataAccountInfo);
        } catch (error) {
            if (error instanceof TokenAccountNotFoundError) {
                console.log(`+ Destination associated token account not found, create associated token account instruction....`);
                transaction.add(createAssociatedTokenAccountInstruction(
                    payer.publicKey,
                    new PublicKey(destinationAccount),
                    new PublicKey(destination),
                    new PublicKey(mint),
                    programId,
                    ASSOCIATED_TOKEN_PROGRAM_ID,
                ));
            } else {
                throw error;
            }
        }
        console.log(`- Create mint to instruction....`);
        transaction.add(createMintToInstruction(
            new PublicKey(mint),
            new PublicKey(destinationAccount),
            payer.publicKey,
            Number(mintAmount),
            [],
            programId,
        ));
        console.log(`- Start send mint token transaction....`);
        const mintTokenHash = await sendAndConfirmTransaction(connection, transaction, [payer], {commitment: DEFAULT_COMMITMENT});
        console.log(`+ Mint token transaction send successful. hash="${mintTokenHash}".`);
        return mintTokenHash;
    }

    static generateATAAddress(address, mint, programId) {
        const seeds = [
            new PublicKey(address).toBytes(),
            new PublicKey(programId).toBytes(),
            new PublicKey(mint).toBytes(),
        ];
        const [ata] = PublicKey.findProgramAddressSync(seeds, ASSOCIATED_TOKEN_PROGRAM_ID);
        return ata.toString();
    };

    static async getAssociatedTokenAccount(connection, account, programId) {
        programId         = programId ? new PublicKey(programId) : null;
        const accountInfo = await getAccount(connection, new PublicKey(account), DEFAULT_COMMITMENT, programId);
        return {
            account:           account,
            mint:              accountInfo.mint.toString(),
            owner:             accountInfo.owner.toString(),
            amount:            accountInfo.amount,
            delegate:          accountInfo.delegate,
            delegatedAmount:   accountInfo.delegatedAmount,
            isInitialized:     accountInfo.isInitialized,
            isFrozen:          accountInfo.isFrozen,
            isNative:          accountInfo.isNative,
            rentExemptReserve: accountInfo.rentExemptReserve,
            closeAuthority:    accountInfo.closeAuthority,
            tlvData:           accountInfo.tlvData,
        };
    }

    static async transfer(connection, payerPrivateKey, destination, amount, commitment = DEFAULT_COMMITMENT) {
        console.log(`- Start building transfer SOL transaction ....`);
        const payer       = Keypair.fromSecretKey(new Uint8Array(bs58.decode(payerPrivateKey)));
        const transaction = new Transaction();
        const instruction = SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey:   new PublicKey(destination),
            lamports:   etherUtils.parseUnits(amount.toString(), 9).toString(),
        });
        transaction.add(instruction);
        const transferHash = await sendAndConfirmTransaction(connection, transaction, [payer], {commitment: DEFAULT_COMMITMENT});
        console.log(`+ Transfer ${amount} SOL transaction send successful. hash="${transferHash}".`);
        return transferHash;
    }

    static async tokenTransfer(connection, payerPrivateKey, mint, destination, amount, commitment = DEFAULT_COMMITMENT, programIdVersion) {
        const payer   = Keypair.fromSecretKey(new Uint8Array(bs58.decode(payerPrivateKey)));
        let programId = TOKEN_PROGRAM_ID_MAPPING[programIdVersion];
        let tokenInfo;
        try {
            tokenInfo = await this.getTokenMetadata(connection, mint, commitment, programIdVersion);
        } catch (err) {
            throw new Error(`Get token metadata failed: ${err.message}`);
        }
        console.log(`- Start building transfer ${tokenInfo.symbol} transaction ....`);
        const senderAccount = this.generateATAAddress(payer.publicKey, mint, programId);
        let senderAccountInfo;
        try {
            senderAccountInfo = await this.getAssociatedTokenAccount(connection, senderAccount, programId);
        } catch (error) {
            if (error instanceof TokenAccountNotFoundError) {
                throw new Error("Sender associated token account not found.");
            } else {
                throw error;
            }
        }
        const transferAmount = etherUtils.parseUnits(amount.toString(), tokenInfo.decimals).toString();
        if (senderAccountInfo.amount < Number(transferAmount)) {
            throw new Error(`Build ${tokenInfo.symbol} transfer failed: insufficient balance`);
        }

        const receiverAccount = this.generateATAAddress(destination, mint, programId);
        const transaction     = new Transaction();
        try {
            await this.getAssociatedTokenAccount(connection, receiverAccount, programId);
        } catch (error) {
            if (error instanceof TokenAccountNotFoundError) {
                //TODO 这里需要计算创建关联账户转账到该账户到 lamports
                transaction.add(createAssociatedTokenAccountInstruction(
                    payer.publicKey,
                    new PublicKey(receiverAccount),
                    new PublicKey(destination),
                    new PublicKey(mint),
                    programId,
                    ASSOCIATED_TOKEN_PROGRAM_ID,
                ));
            } else {
                throw error;
            }
        }
        const instruction = createTransferCheckedInstruction(
            new PublicKey(senderAccount),
            new PublicKey(mint),
            new PublicKey(receiverAccount),
            new PublicKey(payer.publicKey),
            Number(transferAmount),
            tokenInfo.decimals,
            [],
            programId,
        );

        transaction.add(instruction);
        const transferHash = await sendAndConfirmTransaction(connection, transaction, [payer], {commitment: DEFAULT_COMMITMENT});
        console.log(`+ Transfer ${amount} ${tokenInfo.symbol} transaction send successful. hash="${transferHash}".`);
        return transferHash;
    }

    static async setAuthority(connection, payerPrivateKey, mint, authorityType, newAuthority, commitment = DEFAULT_COMMITMENT, programIdVersion) {
        console.log(`- Start building set authority transaction ....`);
        const payer        = Keypair.fromSecretKey(new Uint8Array(bs58.decode(payerPrivateKey)));
        let programId      = TOKEN_PROGRAM_ID_MAPPING[programIdVersion];
        let _authorityType = AUTHORITY_TYPE[authorityType];
        const transaction  = new Transaction();
        console.log(`  Token=${mint} || authorityType=${authorityType} || oldAuthority=${payer.publicKey} || newAuthority=${newAuthority}`);
        if (_authorityType === AUTHORITY_TYPE.update) {
            transaction.add(
                createUpdateAuthorityInstruction({
                    programId,
                    metadata:     new PublicKey(mint),
                    oldAuthority: payer.publicKey,
                    newAuthority: new PublicKey(newAuthority),
                }),
            );
        } else {
            transaction.add(
                createSetAuthorityInstruction(
                    new PublicKey(mint),
                    payer.publicKey,
                    _authorityType,
                    new PublicKey(newAuthority),
                    [],
                    programId,
                ),
            );
        }
        const authHash = await sendAndConfirmTransaction(connection, transaction, [payer], {commitment: DEFAULT_COMMITMENT});
        console.log(`+ Set authority transaction send successful. hash="${authHash}".`);
        return authHash;
    }


}


module.exports = Connection;
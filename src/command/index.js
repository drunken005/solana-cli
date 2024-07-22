const {Command}   = require("commander");
const bs58        = require("bs58");
const {Keypair}   = require("@solana/web3.js");
const Connection  = require("../connection");
const CommandUtil = require("../command_util");


const program = new Command();

program
    .description("CLI to solana wallet")
    .version("1.0.5", "-v, --version", "output the current version")
    .hook("preAction", CommandUtil.preAction);

program.command("wallet")
    .description("Display the current environment wallet public key address")
    .action((input) => {
        const privateKey = process.env.SOLANA_PRIVATE_KEY;
        if (!privateKey) {
            return console.log("Please set account private key to environment variable. Execute `export SOLANA_PRIVATE_KEY=${your account private key}`");
        }
        const secretKey = new Uint8Array(bs58.decode(privateKey));
        let _wallet     = Keypair.fromSecretKey(secretKey);
        const wallet    = {
            // "privateKey": bs58.encode(_wallet.secretKey),
            "publicKey": _wallet.publicKey.toBase58(),
            "address":   _wallet.publicKey.toBase58(),
        };
        console.log(wallet);
        return wallet;
    });

program.command("createWallet")
    .description("Create a new wallet keypair(The newly created wallet cannot be used. You need to execute 'export SOLANA_PRIVATE_KEY=${your private key string}' first.)")
    .action((input) => {
        let _wallet  = Keypair.generate();
        const wallet = {
            "privateKey": bs58.encode(_wallet.secretKey),
            "publicKey":  _wallet.publicKey.toBase58(),
            "address":    _wallet.publicKey.toBase58(),
        };
        console.log(wallet);
        return wallet;
    });

program.command("getEndpoint")
    .description("Return current connection provider endpoint")
    .action((input) => {
        const endpoint = Connection.endpoint(input._network);
        console.log(endpoint);
        return endpoint;
    });

program.command("getSlot")
    .description("Fetch the slot that has reached the given or default commitment level, call rpc.getSlot()")
    .option("-c, --commitment <string>", "Configuring State Commitment, values of(finalized | confirmed | processed)", CommandUtil.checkCommitment, "finalized")
    .action(async (input) => {
        const slot = await Connection.getSlot(Connection.provider(input._network), input.commitment);
        console.log(slot);
        return slot;
    });

program.command("getRecentBlock")
    .description("Fetch the latest blockhash from the cluster")
    .option("-c, --commitment <string>", "Configuring State Commitment, values of(finalized | confirmed | processed)", CommandUtil.checkCommitment, "finalized")
    .action(async (input) => {
        const recentBlock = await Connection.getRecentBlock(Connection.provider(input._network), input.commitment);
        console.log(recentBlock);
        return recentBlock;
    });

program.command("getTransaction")
    .description("Fetch parsed transaction details for a confirmed or finalized transaction")
    .requiredOption("-hash, --hash <string>", "Transaction hash")
    .option("-c, --commitment <string>", "Configuring State Commitment, values of(finalized | confirmed | processed)", CommandUtil.checkCommitment, "finalized")
    .action(async (input) => {
        const transaction = await Connection.getTransaction(Connection.provider(input._network), input.hash, input.commitment);
        console.log(JSON.stringify(transaction, null, 4));
        return transaction;
    });

program.command("getBalance")
    .description("Fetch the balance for the specified public key")
    .requiredOption("-a, --address <string>", "Address public key")
    .option("-c, --commitment <string>", "Configuring State Commitment, values of(finalized | confirmed | processed)", CommandUtil.checkCommitment, "finalized")
    .action(async (input) => {
        const balance = await Connection.getBalance(Connection.provider(input._network), input.address, input.commitment);
        console.log(JSON.stringify(balance, null, 4));
        return balance;
    });

program.command("transfer")
    .description("Transfer sol to the destination address")
    .requiredOption("-d, --destination <string>", "Account that will receive transferred sol")
    .requiredOption("-a, --amount <number>", "Amount to transfer")
    .option("-c, --commitment <string>", "Configuring State Commitment, values of(finalized | confirmed | processed)", CommandUtil.checkCommitment, "finalized")
    .action(async (input) => {
        try {
            return await Connection.transfer(Connection.provider(input._network), input._privateKey, input.destination, input.amount, input.commitment);
        }catch (error){
            program.error(error.message);
        }
    }).hook("preAction", CommandUtil.subPreAction);

const tokenCommand = require("./token");
program.addCommand(tokenCommand);

program.parse(process.argv);


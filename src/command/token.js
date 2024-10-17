const {Command}   = require("commander");
const CommandUtil = require("../command_util");
const Connection  = require("../connection");

const program = new Command();

program
    .name("token")
    .description("CLI to solana token tools, First you must set the private key to the environment variable SOLANA_PRIVATE=${Your private key}")
    .version("1.0.2", "-v, --version", "output the current version")
    .hook("preAction", CommandUtil.subPreAction);

program.command("info")
    .description("Ϟ Get solana SPL-TOKEN informationϞ")
    .requiredOption("-m, --mint <string>", "Mint for the account")
    .option("-p, --programId <string>", "SPL-TOKEN programId version, values of (TOKEN || TOKEN_2022)", CommandUtil.checkTokenProgramIdVersion)
    .action(async (input) => {
        const metadata = await Connection.tokenInfo(Connection.provider(input._network), input.mint, null, input.programId);
        console.log(metadata);
    });

program.command("deploy")
    .description("Ϟ Deploy new solana SPL-TOKEN Ϟ")
    .requiredOption("-n, --name <string>", "Token name")
    .requiredOption("-s, --symbol <string>", "Token symbol")
    .requiredOption("-u, --uri <string>", "Token URI")
    .requiredOption("-d, --decimals <number>", "Token decimals")
    .requiredOption("-a, --amount <number>", "First supply amount")
    .requiredOption("-m, --metadataAccount <string>", "Whether to create metadataAccount, if not, use extension (only valid for TOKEN_2022_PROGRAM_ID)", CommandUtil.checkMetadataAccount)
    .requiredOption("-p, --programId <string>", "SPL-TOKEN programId version, values of (TOKEN || TOKEN_2022)", CommandUtil.checkTokenProgramIdVersion)
    .action(async (input) => {
        const token = await Connection.deployToken(Connection.provider(input._network), input._privateKey, input.name, input.symbol, input.uri, input.decimals, input.amount, input.metadataAccount, input.programId);
        console.log(`Token info create and mint success, details: `);
        console.log(token);
        return token;
    });

program.command("mint")
    .description("Ϟ Min solana SPL-TOKEN amount Ϟ")
    .requiredOption("-m, --mint <string>", "Mint for the account")
    .requiredOption("-d, --destination <string>", "Address of the account to mint to")
    .requiredOption("-a, --amount <number>", "Amount to mint")
    .requiredOption("-p, --programId <string>", "SPL-TOKEN programId version, values of (TOKEN || TOKEN_2022)", CommandUtil.checkTokenProgramIdVersion)
    .action(async (input) => {
        return await Connection.mintToken(Connection.provider(input._network), input._privateKey, input.mint, input.destination, input.amount, input.programId);
    });

program.command("getBalance")
    .description("Fetch parsed token accounts owned by the specified account")
    .requiredOption("-a, --address <string>", "Address public key")
    .option("-m, --mint <string>", "SPL-TOKEN account")
    .option("-p, --programId <string>", "SPL-TOKEN programId version, values of (TOKEN || TOKEN_2022)", CommandUtil.checkTokenProgramIdVersion, "TOKEN")
    .option("-c, --commitment <string>", "Configuring State Commitment, values of(finalized | confirmed | processed)", CommandUtil.checkCommitment, "finalized")
    .action(async (input) => {
        const balance = await Connection.getTokenBalance(Connection.provider(input._network), input.address, input.mint, input.programId, input.commitment);
        console.log(JSON.stringify(balance, null, 4));
        return balance;
    });

program.command("transfer")
    .description("Transfer spl token to the destination address")
    .requiredOption("-m, --mint <string>", "Mint for the account")
    .requiredOption("-d, --destination <string>", "Account that will receive transferred token")
    .requiredOption("-a, --amount <number>", "Amount to transfer")
    .requiredOption("-p, --programId <string>", "SPL-TOKEN programId version, values of (TOKEN || TOKEN_2022)", CommandUtil.checkTokenProgramIdVersion)
    .option("-c, --commitment <string>", "Configuring State Commitment, values of(finalized | confirmed | processed)", CommandUtil.checkCommitment, "finalized")
    .action(async (input) => {
        try {
            return await Connection.tokenTransfer(Connection.provider(input._network), input._privateKey, input.mint, input.destination, input.amount, input.commitment, input.programId);
        } catch (error) {
            program.error(error.message);
        }
    });

program.command("authorize")
    .description("Set spl token authority to new account")
    .requiredOption("-m, --mint <string>", "Mint for the account")
    .requiredOption("-a, --authorize <string>", "Type of authority to set, values of (mint|freeze|update)", CommandUtil.checkAuthority)
    .requiredOption("-n, --newAuthority <number>", "New authority of the account")
    .requiredOption("-p, --programId <string>", "SPL-TOKEN programId version, values of (TOKEN || TOKEN_2022)", CommandUtil.checkTokenProgramIdVersion)
    .option("-c, --commitment <string>", "Configuring State Commitment, values of(finalized | confirmed | processed)", CommandUtil.checkCommitment, "finalized")
    .action(async (input) => {
        try {
            return await Connection.setAuthority(Connection.provider(input._network), input._privateKey, input.mint, input.authorize, input.newAuthority, input.commitment, input.programId);
        } catch (error) {
            program.error(error.message);
        }
    });

program.command("update")
    .description("Update spl token metadata")
    .requiredOption("-m, --mint <string>", "Mint for the account")
    .requiredOption("-f, --field <string>", "Field to update in the metadata (name|symbol|uri)", CommandUtil.checkMetadataField)
    .requiredOption("-V, --value <number>", " Value to write for the field")
    .requiredOption("-p, --programId <string>", "SPL-TOKEN programId version, values of (TOKEN || TOKEN_2022)", CommandUtil.checkTokenProgramIdVersion)
    .option("-c, --commitment <string>", "Configuring State Commitment, values of(finalized | confirmed | processed)", CommandUtil.checkCommitment, "finalized")
    .action(async (input) => {
        try {
            return await Connection.updateMetadataField(Connection.provider(input._network), input._privateKey, input.mint, input.field, input.value, input.commitment, input.programId);
        } catch (error) {
            program.error(error.message);
        }
    });

module.exports = program;

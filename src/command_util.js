const {
          InvalidArgumentError,
          CommanderError,
      } = require("commander");

class CommandUtil {

    static preAction(thisCommand, actionCommand) {
        CommandUtil.checkNetwork(thisCommand);
        actionCommand.setOptionValue("_network", process.env.SOLANA_NETWORK);
        // console.log(actionCommand.opts())
    }

    static subPreAction(thisCommand, actionCommand) {
        CommandUtil.checkAccountPrivateKey(thisCommand);
        actionCommand.setOptionValue("_privateKey", process.env.SOLANA_PRIVATE_KEY);
        // console.log(actionCommand.opts())
        // console.log('==========subPreAction======================')
    }

    static checkNetwork(command) {
        if (!process.env.SOLANA_NETWORK) {
            command.error("Please set the network to environment variable. Execute `export SOLANA_NETWORK=devnet|testnet|mainnet-beta`");
        }
    }

    static checkAccountPrivateKey(command) {
        if (!process.env.SOLANA_PRIVATE_KEY) {
            command.error('Please set account private key to environment variable. Execute `export SOLANA_PRIVATE_KEY=${your account private key}`');
        }
    }

    static checkCommitment(commitment, previous) {
        if (!/^(finalized|confirmed|processed)$/.test(commitment)) {
            throw new InvalidArgumentError("Just one of(finalized|confirmed|processed)");
        }
        return commitment;
    }

    static checkTokenProgramIdVersion(programIdVersion, previous) {
        if (!/^(TOKEN|TOKEN_2022)$/.test(programIdVersion)) {
            throw new InvalidArgumentError("Just one of(TOKEN|TOKEN_2022)");
        }
        return programIdVersion;
    }

    static checkMetadataAccount(programIdVersion, previous) {
        if (!/^(YES|NO)$/.test(programIdVersion)) {
            throw new InvalidArgumentError("Just one of(YES|NO)");
        }
        return programIdVersion;
    }

    static checkAuthority(authorize, previous) {
        if (!/^(mint|freeze|update)$/.test(authorize)) {
            throw new InvalidArgumentError("Authority type Just one of(mint|freeze)");
        }
        return authorize;
    }

    static checkMetadataField(field, previous) {
        if (!/^(name|symbol|uri)$/.test(field)) {
            throw new InvalidArgumentError("Field type Just one of(name|symbol|uri)");
        }
        return field;
    }
}


module.exports = CommandUtil;
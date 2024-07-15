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
}


module.exports = CommandUtil;
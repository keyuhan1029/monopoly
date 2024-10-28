const MonopolyGame = artifacts.require("MonopolyGame");

module.exports = function(deployer) {
    deployer.deploy(MonopolyGame);
};

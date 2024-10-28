const GameRoom = artifacts.require("GameRoom");

module.exports = function(deployer) {
    deployer.deploy(GameRoom);
};

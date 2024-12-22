const Token = artifacts.require("Token");

module.exports = function (deployer) {
    // 部署 Token 合約
    deployer.deploy(Token);
};
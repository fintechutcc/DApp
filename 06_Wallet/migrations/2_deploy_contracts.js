var MoolahCoin = artifacts.require("MoolahCoin");
var Condos = artifacts.require("Condos");

module.exports = function(deployer) {
  deployer.deploy(MoolahCoin); 
  deployer.deploy(Condos);
};
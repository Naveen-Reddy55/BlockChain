const Cybo = artifacts.require("Cybo");

module.exports = async function (deployer) {
  await deployer.deploy(Cybo,utils.parseEther("1000.0"));
};

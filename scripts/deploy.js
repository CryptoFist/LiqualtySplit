// LP token: 0xE891cb3A87201ffE0E68A169F62Ef7606960b00f
// spliter pool: 0xFd9577Ce2838102372285478E6745DC5583D54E5
const { parseEther } = require('ethers/lib/utils');
 const { ethers } = require('hardhat');
 
 async function main() {
 
   const [deployer] = await ethers.getSigners();
 
   console.log("Deploying contracts with the account:", deployer.address);

   this.ERC20 = await ethers.getContractFactory('ERC20Mock');
   this.ERC20 = await this.ERC20.deploy('LiqualitySplit', 'LP');
   await this.ERC20.deployed();
   console.log('LP token address is ', this.ERC20.address);

   this.liqualitySplit = await ethers.getContractFactory('LiqualitySplit');
   this.liqualitySplit = await upgrades.deployProxy(this.liqualitySplit, [this.ERC20.address]);
   await this.liqualitySplit.deployed();

   console.log('split address is ', this.liqualitySplit.address); 
   console.log("Deployed successfully!");
 }
 
 main()
   .then(() => process.exit(0))
   .catch((error) => {
     console.error(error);
     process.exit(1);
   });
const { expect } = require('chai');
const { ethers } = require('hardhat');

const bigNum = num=>(num + '0'.repeat(18))
const smallNum = num=>(parseInt(num)/bigNum(1))

describe('LiqualitySplit', function () {
   before (async function () {
      [
         this.owner,
         this.addr1,
         this.addr2,
         this.addr3,
         this.addr4
      ] = await ethers.getSigners();

      this.ERC20 = await ethers.getContractFactory('ERC20Mock');
      this.ERC20 = await this.ERC20.deploy('LiqualitySplit', 'LP');
      await this.ERC20.deployed();

      this.liqualitySplit = await ethers.getContractFactory('LiqualitySplit');
      this.liqualitySplit = await upgrades.deployProxy(this.liqualitySplit, [this.ERC20.address]);
      await this.liqualitySplit.deployed();

      console.log('split address is ', this.liqualitySplit.address);

      await this.ERC20.transfer(this.addr1.address, bigNum(1000));
      await this.ERC20.transfer(this.addr2.address, bigNum(1000));
      await this.ERC20.transfer(this.addr1.address, bigNum(1000));
      await this.ERC20.transfer(this.addr1.address, bigNum(1000));

   })

   beforeEach(async function () {
      await this.ERC20.connect(this.addr1).approve(this.liqualitySplit.address, bigNum(100));
      await this.ERC20.connect(this.addr2).approve(this.liqualitySplit.address, bigNum(100));
      await this.ERC20.connect(this.addr3).approve(this.liqualitySplit.address, bigNum(100));
      await this.ERC20.connect(this.addr4).approve(this.liqualitySplit.address, bigNum(100));
   })

   it ('add shareAmount to pool', async function () {
      await expect(
         this.liqualitySplit.connect(this.addr1).addShare(bigNum(30))
      ).to.be.emit(this.liqualitySplit, 'AddShare')
      .withArgs(
         this.addr1.address,
         bigNum(30)
      );

      await expect(
         this.liqualitySplit.connect(this.addr2).addShare(bigNum(70))
      ).to.be.emit(this.liqualitySplit, 'AddShare')
      .withArgs(
         this.addr2.address,
         bigNum(70)
      );
   })

   it ('deposit ETH and withdraw ETH', async function () {
      await this.liqualitySplit.depositeETH({value: bigNum(1)});
      let oldBalance = smallNum(await ethers.provider.getBalance(this.addr2.address));
      await this.liqualitySplit.connect(this.addr2).withDraw();
      const withDrawedAmount = smallNum(await ethers.provider.getBalance(this.addr2.address)) - oldBalance;
      expect(withDrawedAmount).to.greaterThan(0.69);
   })

   it ('set streamingTime', async function () {
      await expect(
         this.liqualitySplit.connect(this.addr2).setStreamingTime(0)
      ).to.be.revertedWith('incorrect time');
      await this.liqualitySplit.connect(this.addr2).setStreamingTime(2592000);
      await expect(
         this.liqualitySplit.connect(this.addr2).setStreamingTime(2592000)
      ).to.be.revertedWith('already set');
   })

   it ('deposit ETH and withdraw ETH again', async function () {
      await network.provider.send("evm_increaseTime", [1000 * 40]);
      await network.provider.send("evm_mine");
      await this.liqualitySplit.depositeETH({value: bigNum(1)});
      let oldBalance = smallNum(await ethers.provider.getBalance(this.addr2.address));
      await this.liqualitySplit.connect(this.addr2).withDraw();
      const withDrawedAmount = smallNum(await ethers.provider.getBalance(this.addr2.address)) - oldBalance;
      expect(withDrawedAmount).to.greaterThan(0);
   })


})


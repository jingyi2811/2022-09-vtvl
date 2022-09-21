import {expect} from "chai";
// @ts-ignore
import {ethers} from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("Vested amount", function () {
    let admin: any
    let account1: any
    let TestERC20TokenMock: any
    let VTVLVestingFactory: any
    let VTVLVestingMock: any
    let timestamp: any

    beforeEach(async function () {
        [admin, account1] = await ethers.getSigners();

        const TestERC20TokenFactory = await ethers.getContractFactory("TestERC20Token")
        TestERC20TokenMock = await TestERC20TokenFactory.deploy(
            'Test coin',
            'TEST',
            1_000_000
        )

        VTVLVestingFactory = await ethers.getContractFactory("VTVLVesting");

        // Try to deploy with zero address, should fail
        // @ts-ignore
        await expect(VTVLVestingFactory.deploy('0x0000000000000000000000000000000000000000')).to.be.reverted

        // Deploy with concrete address
        VTVLVestingMock = await VTVLVestingFactory.deploy(TestERC20TokenMock.address);

        const AnotherTestERC20TokenFactory = await ethers.getContractFactory("TestERC20Token")
        const AnotherTestERC20TokenMock = await AnotherTestERC20TokenFactory.deploy(
            'Test coin',
            'TEST',
            1_000_000)
        await TestERC20TokenMock.connect(admin).transfer(VTVLVestingMock.address, 1_000_000)

        timestamp = await (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;

        await VTVLVestingMock.connect(admin).createClaimsBatch(
            [account1.address],   // recipient
            [timestamp],          // start timestamp
            [timestamp + 12],      // end timestamp
            [0],          // cliff Release timestamp
            [3],                  // Release Interval Secs
            [1_000],                  // Linear vest amount
            [0]                   // Cliff amount
        )
    });

    it("Check if vested amount is correct for linear only vesting product", async function () {
        const currentTimestamp = await (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
        expect(await VTVLVestingMock.vestedAmount(account1.address, currentTimestamp)).to.be.equal(100)

        // Wait for 1 more second
        // await helpers.time.increaseTo(currentTimestamp + 1);
        // expect(await VTVLVestingMock.vestedAmount(account1.address, currentTimestamp + 1)).to.be.equal(200)
        //
        // // Wait for 1 more second
        // await helpers.time.increaseTo(currentTimestamp + 2);
        // expect(await VTVLVestingMock.vestedAmount(account1.address, currentTimestamp + 2)).to.be.equal(300)
        //
        // // Wait for 1 more second
        // await helpers.time.increaseTo(currentTimestamp + 3);
        // expect(await VTVLVestingMock.vestedAmount(account1.address, currentTimestamp + 3)).to.be.equal(400)
        //
        // // Wait for 1 more second
        // await helpers.time.increaseTo(currentTimestamp + 4);
        // expect(await VTVLVestingMock.vestedAmount(account1.address, currentTimestamp + 4)).to.be.equal(500)
        //
        // // Wait for 20 more seconds
        // await helpers.time.increaseTo(currentTimestamp + 20);
        // expect(await VTVLVestingMock.vestedAmount(account1.address, currentTimestamp + 9)).to.be.equal(1_000)
    })
})
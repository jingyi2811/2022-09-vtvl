import {expect} from "chai";
// @ts-ignore
import {ethers} from "hardhat";

describe("Revoke claim", function () {
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
            [timestamp + 1],      // end timestamp
            [timestamp],          // cliff Release timestamp
            [1],                  // Release Interval Secs
            [1],                  // Linear vest amount
            [2]                   // Cliff amount
        )
    });

    it("Should be able to revoke", async function () {

        // Before revoke
        {
            const claim = await VTVLVestingMock.getClaim(account1.address)
            expect(claim.isActive).to.equal(true)
            expect(await VTVLVestingMock.numTokensReservedForVesting()).to.equal(3)

            expect(await VTVLVestingMock.finalVestedAmount(account1.address)).to.equal(3)
        }

        // REVOKE
        await VTVLVestingMock.connect(admin).revokeClaim(account1.address)

        // After revoke
        {
            const claim = await VTVLVestingMock.getClaim(account1.address)
            expect(claim.isActive).to.equal(false)
            expect(await VTVLVestingMock.numTokensReservedForVesting()).to.equal(0)

            expect(await VTVLVestingMock.finalVestedAmount(account1.address)).to.equal(0)
        }
    })
})
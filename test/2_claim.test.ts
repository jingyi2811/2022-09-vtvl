import {expect} from "chai";
// @ts-ignore
import {ethers} from "hardhat";

describe("Claim", function () {
    let admin: any
    let account1: any
    let TestERC20TokenMock: any
    let VTVLVestingFactory: any
    let VTVLVestingMock: any

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
    });

    it("Create claim", async function () {
        const AnotherTestERC20TokenFactory = await ethers.getContractFactory("TestERC20Token")
        const AnotherTestERC20TokenMock = await AnotherTestERC20TokenFactory.deploy(
            'Test coin',
            'TEST',
            1_000_000)

        await TestERC20TokenMock.connect(admin).transfer(VTVLVestingMock.address, 1_000_000)

        const timestamp = await (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;

        await VTVLVestingMock.connect(admin).createClaim(
            account1.address,   // recipient
            timestamp,          // start timestamp
            timestamp + 1,      // end timestamp
            timestamp,          // cliff Release timestamp
            1,                  // Release Interval Secs
            1,                  // Linear vest amount
            2                   // Cliff amount
        )

        // 1 + 2 = 3
        expect(await VTVLVestingMock.numTokensReservedForVesting()).to.equal(3)

        expect(await VTVLVestingMock.numVestingRecipients()).to.equal(1)
    })

    it("Should not create claim if address is 0", async function () {
        const timestamp = await (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
        await expect (VTVLVestingMock.connect(admin).createClaim(
            '0x0000000000000000000000000000000000000000',   // recipient
            timestamp,          // start timestamp
            timestamp + 1,      // end timestamp
            timestamp,          // cliff Release timestamp
            1,                  // Release Interval Secs
            1,                  // Linear vest amount
            2                   // Cliff amount
        )).to.be.revertedWith('INVALID_ADDRESS')
    })

    it("Should not create claim if linear vest amount + cliff amount = 0", async function () {
        const timestamp = await (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
        await expect (VTVLVestingMock.connect(admin).createClaim(
            admin.address,   // recipient
            timestamp,          // start timestamp
            timestamp + 1,      // end timestamp
            timestamp,          // cliff Release timestamp
            1,                  // Release Interval Secs
            0,                  // Linear vest amount
            0                   // Cliff amount
        )).to.be.revertedWith('INVALID_VESTED_AMOUNT')
    })

    it("Should not create claim if start timestamp = 0", async function () {
        const timestamp = await (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
        await expect(VTVLVestingMock.connect(admin).createClaim(
            account1.address,   // recipient
            0,                  // start timestamp
            timestamp + 1,      // end timestamp
            timestamp,          // cliff Release timestamp
            1,                  // Release Interval Secs
            1,                  // Linear vest amount
            2                   // Cliff amount
        )).to.be.revertedWith('INVALID_START_TIMESTAMP')
    })

    it("Should not create claim if start timestamp >= end timestamp", async function () {
        const timestamp = await (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
        await expect (VTVLVestingMock.connect(admin).createClaim(
            admin.address,   // recipient
            timestamp,          // start timestamp
            timestamp,          // end timestamp
            timestamp,          // cliff Release timestamp
            1,                  // Release Interval Secs
            1,                  // Linear vest amount
            2                   // Cliff amount
        )).to.be.revertedWith('INVALID_END_TIMESTAMP')
    })

    it("Should not create claim if invalid release integer", async function () {
        const timestamp = await (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
        await expect (VTVLVestingMock.connect(admin).createClaim(
            admin.address,   // recipient
            timestamp,          // start timestamp
            timestamp + 1,          // end timestamp
            timestamp,          // cliff Release timestamp
            0,                  // Release Interval Secs
            1,                  // Linear vest amount
            2                   // Cliff amount
        )).to.be.revertedWith('INVALID_RELEASE_INTERVAL')
    })

    it("Should not create claim if invalid interval length", async function () {
        const timestamp = await (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
        await expect (VTVLVestingMock.connect(admin).createClaim(
            admin.address,      // recipient
            timestamp,          // start timestamp
            timestamp + 86400,  // end timestamp
            timestamp,          // cliff Release timestamp
            86399,              // Release Interval Secs
            1,                  // Linear vest amount
            2                   // Cliff amount
        )).to.be.revertedWith('INVALID_INTERVAL_LENGTH')
    })

    it("Should not create claim if invalid cliff data", async function () {
        const timestamp = await (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;

        {
            await expect(VTVLVestingMock.connect(admin).createClaim(
                admin.address,      // recipient
                timestamp,          // start timestamp
                timestamp + 86400,  // end timestamp
                timestamp + 1,      // cliff Release timestamp
                86400,              // Release Interval Secs
                1,                  // Linear vest amount
                2                   // Cliff amount
            )).to.be.revertedWith('INVALID_CLIFF')
        }

        {
            await expect(VTVLVestingMock.connect(admin).createClaim(
                admin.address,      // recipient
                timestamp,          // start timestamp
                timestamp + 86400,  // end timestamp
                0,      // cliff Release timestamp
                86400,              // Release Interval Secs
                1,                  // Linear vest amount
                2                   // Cliff amount
            )).to.be.revertedWith('INVALID_CLIFF')
        }
    })

    it("Should not create claim if contract balance less than linear and cliff amount", async function () {
        const timestamp = await (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
        await expect(VTVLVestingMock.connect(admin).createClaim(
            account1.address,   // recipient
            timestamp,                  // start timestamp
            timestamp + 1,      // end timestamp
            timestamp,          // cliff Release timestamp
            1,                  // Release Interval Secs
            1,                  // Linear vest amount
            2                   // Cliff amount
        )).to.be.revertedWith('INSUFFICIENT_BALANCE')
    })
});


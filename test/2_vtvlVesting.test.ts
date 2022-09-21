import {expect} from "chai";
import {ethers} from "hardhat";

describe("VariableSupplyERC20Token", function () {
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
            account1.address,
            timestamp,
            timestamp + 1,
            timestamp,
            1,
            1,
            1
        )
    })

    it("withdraw", async function () {

        // Added claims

        const AnotherTestERC20TokenFactory = await ethers.getContractFactory("TestERC20Token")
        const AnotherTestERC20TokenMock = await AnotherTestERC20TokenFactory.deploy(
            'Test coin',
            'TEST',
            1_000_000)

        await TestERC20TokenMock.connect(admin).transfer(VTVLVestingMock.address, 1_000_000)

        const timestamp = await (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;

        await VTVLVestingMock.connect(admin).createClaim(
            account1.address,
            timestamp,
            timestamp + 1,
            timestamp,
            1,
            1,
            1
        )

        await VTVLVestingMock.connect(account1).withdraw()
    })

    it("withdrawAdmin", async function () {

        // Added claims

        const AnotherTestERC20TokenFactory = await ethers.getContractFactory("TestERC20Token")
        const AnotherTestERC20TokenMock = await AnotherTestERC20TokenFactory.deploy(
            'Test coin',
            'TEST',
            1_000_000)

        await TestERC20TokenMock.connect(admin).transfer(VTVLVestingMock.address, 1_000_000)

        const timestamp = await (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;

        await VTVLVestingMock.connect(admin).createClaim(
            account1.address,
            timestamp,
            timestamp + 1,
            timestamp,
            1,
            1,
            1
        )

        await VTVLVestingMock.connect(admin).withdrawAdmin(999_998)
    })

    it.only("Revoke claim", async function () {
        // Added claims
        const AnotherTestERC20TokenFactory = await ethers.getContractFactory("TestERC20Token")
        const AnotherTestERC20TokenMock = await AnotherTestERC20TokenFactory.deploy(
            'Test coin',
            'TEST',
            1_000_000)

        await TestERC20TokenMock.connect(admin).transfer(VTVLVestingMock.address, 1_000_000)

        const timestamp = await (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;

        await VTVLVestingMock.connect(admin).createClaim(
            account1.address,
            timestamp,
            timestamp + 1,
            timestamp,
            1,
            1,
            1
        )

        await VTVLVestingMock.connect(admin).revokeClaim(account1.address)
    })

    it("Withdraw other token", async function () {
        const AnotherTestERC20TokenFactory = await ethers.getContractFactory("TestERC20Token")
        const AnotherTestERC20TokenMock = await AnotherTestERC20TokenFactory.deploy(
            'Test coin',
            'TEST',
            1_000_000)

        await VTVLVestingMock.connect(admin).withdrawOtherToken(AnotherTestERC20TokenMock.address)
    })
});


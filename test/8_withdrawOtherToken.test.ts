import {expect} from "chai";
// @ts-ignore
import {ethers} from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("Withdraw other token", function () {
    let admin: any
    let account1: any
    let TestERC20TokenMock: any
    let VTVLVestingFactory: any
    let VTVLVestingMock: any
    let timestamp: any
    let AnotherTestERC20TokenMock: any

    beforeEach(async function () {
        [admin, account1] = await ethers.getSigners();

        const TestERC20TokenFactory = await ethers.getContractFactory("TestERC20Token")
        TestERC20TokenMock = await TestERC20TokenFactory.deploy(
            'Test coin',
            'TEST',
            1_000_000
        )

        VTVLVestingFactory = await ethers.getContractFactory("VTVLVesting");
        VTVLVestingMock = await VTVLVestingFactory.deploy(TestERC20TokenMock.address);

        const AnotherTestERC20TokenFactory = await ethers.getContractFactory("TestERC20Token")
        AnotherTestERC20TokenMock = await AnotherTestERC20TokenFactory.deploy(
            'Test coin',
            'TEST',
            1_000_000)
        await AnotherTestERC20TokenMock.connect(admin).transfer(VTVLVestingMock.address, 1_000_000)
    });

    it("Withdraw all other token", async function () {

        // Check balance before
        expect(await AnotherTestERC20TokenMock.balanceOf(admin.address)).to.be.equal(0)
        expect(await AnotherTestERC20TokenMock.balanceOf(VTVLVestingMock.address)).to.be.equal(1_000_000)

        // Withdraw
        await VTVLVestingMock.connect(admin).withdrawOtherToken(AnotherTestERC20TokenMock.address)

        // Check balance after
        expect(await AnotherTestERC20TokenMock.balanceOf(admin.address)).to.be.equal(1_000_000)
        expect(await AnotherTestERC20TokenMock.balanceOf(VTVLVestingMock.address)).to.be.equal(0)
    })
})
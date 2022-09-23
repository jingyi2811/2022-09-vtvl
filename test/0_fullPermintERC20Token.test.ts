import {expect} from "chai";
// @ts-ignore
import {ethers} from "hardhat";

describe("FullPermintERC20Token", function () {
    const NAME = 'Ali Token'
    const SYMBOL = 'ALI'
    const SUPPLY = 1_000_000

    let admin: any
    let FullPremintERC20TokenFactory: any
    let FullPremintERC20TokenFactoryMock: any

    beforeEach(async function () {
        [admin] = await ethers.getSigners();
        FullPremintERC20TokenFactory = await ethers.getContractFactory("FullPremintERC20Token");
        FullPremintERC20TokenFactoryMock = null
    });

    it("Should deploy", async function () {
        FullPremintERC20TokenFactoryMock = await FullPremintERC20TokenFactory.deploy(
            NAME,
            SYMBOL,
            SUPPLY
        );
    })

    it("Should mint after deployment", async function () {
        FullPremintERC20TokenFactoryMock = await FullPremintERC20TokenFactory.deploy(
            NAME,
            SYMBOL,
            SUPPLY
        );

        expect(await FullPremintERC20TokenFactoryMock.totalSupply()).to.be.equal(1_000_000);
        expect(await FullPremintERC20TokenFactoryMock.balanceOf(admin.address)).to.be.equal(1_000_000);
    })

    it("Should not deploy If supply = 0", async function () {
        await expect(FullPremintERC20TokenFactory.connect(admin).deploy(
            NAME,
            SYMBOL,
            0
        )).to.be.revertedWith('NO_ZERO_MINT');
    })
});


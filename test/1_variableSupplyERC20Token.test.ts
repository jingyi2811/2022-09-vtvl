import {expect} from "chai";
import {ethers} from "hardhat";

describe("VariableSupplyERC20Token", function () {
    const NAME = 'Ali Token'
    const SYMBOL = 'ALI'
    const SUPPLY = 1_000_000

    let admin: any
    let VariableSupplyERC20TokenFactory: any
    let VariableSupplyERC20TokenFactoryMock: any

    beforeEach(async function () {
        [admin] = await ethers.getSigners();
        VariableSupplyERC20TokenFactory = await ethers.getContractFactory("VariableSupplyERC20Token");
        VariableSupplyERC20TokenFactoryMock = null
    });

    it("Should deploy", async function () {
        VariableSupplyERC20TokenFactoryMock = await VariableSupplyERC20TokenFactory.deploy(
            NAME,
            SYMBOL,
            SUPPLY,
            SUPPLY
        );

        expect(await VariableSupplyERC20TokenFactoryMock.totalSupply()).to.be.equal(1_000_000);
        expect(await VariableSupplyERC20TokenFactoryMock.balanceOf(admin.address)).to.be.equal(1_000_000);
    })

    it("Should not deploy if supply = 0", async function () {
        VariableSupplyERC20TokenFactoryMock = await VariableSupplyERC20TokenFactory.deploy(
            NAME,
            SYMBOL,
            0,
            SUPPLY
        )

        expect(await VariableSupplyERC20TokenFactoryMock.totalSupply()).to.be.equal(0);
        expect(await VariableSupplyERC20TokenFactoryMock.balanceOf(admin.address)).to.be.equal(0);
    })

    it.only("Should not deploy if max supply = 0", async function () {
        VariableSupplyERC20TokenFactoryMock = await VariableSupplyERC20TokenFactory.deploy(
            NAME,
            SYMBOL,
            SUPPLY,
            0
        )

        expect(await VariableSupplyERC20TokenFactoryMock.totalSupply()).to.be.equal(0);
        expect(await VariableSupplyERC20TokenFactoryMock.balanceOf(admin.address)).to.be.equal(0);
    })
});


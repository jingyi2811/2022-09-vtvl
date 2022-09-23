import {expect} from "chai";
// @ts-ignore
import {ethers} from "hardhat";
import {Signer} from "ethers";

const iteration = 28 // For ethereum and polygon
//const iteration = 115 // For bsc
//const iteration = 7 // For avalanche

export const randomSigners = async (admin: any, amount: number): Promise<any[]> => {
    const signers: Signer[] = []
    for (let i = 0; i < amount; i++) {
        let wallet = ethers.Wallet.createRandom();
        wallet = wallet.connect(ethers.provider);
        await admin.sendTransaction({to: wallet.address, value: ethers.utils.parseEther("1")});
        signers.push(wallet)
    }
    return signers
}

describe("ClaimBatch", function () {
    let admin: any
    let account1: any
    let TestERC20TokenMock: any
    let VTVLVestingFactory: any
    let VTVLVestingMock: any
    let addressArr: any

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

        addressArr = await randomSigners(admin, 200);

    });

    it("Should be able to create batch claim", async function () {
        const AnotherTestERC20TokenFactory = await ethers.getContractFactory("TestERC20Token")
        const AnotherTestERC20TokenMock = await AnotherTestERC20TokenFactory.deploy(
            'Test coin',
            'TEST',
            1_000_000)
        await TestERC20TokenMock.connect(admin).transfer(VTVLVestingMock.address, 1_000_000)

        const timestamp = await (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;

        await VTVLVestingMock.connect(admin).createClaimsBatch(
            await constructAccountAddress(addressArr),                           // recipient
            await constructArrayElements(timestamp),                   // start timestamp
            await constructArrayElements(timestamp + 1),       // end timestamp
            await constructArrayElements(timestamp),                   // cliff Release timestamp
            await constructArrayElements(1),                   // Release Interval Secs
            await constructArrayElements(1),                   // Linear vest amount
            await constructArrayElements(2),                   // Cliff amount
        )
    })
})

async function constructAccountAddress(addressArr: any) {
    let result = []

    for(let i = 0; i < iteration; i++) {
        result.push(addressArr[i].address)
    }

    return result
}

async function constructArrayElements(element: any) {
    let result = []

    for(let i = 0; i < iteration; i++) {
        result.push(element)
    }

    return result
}
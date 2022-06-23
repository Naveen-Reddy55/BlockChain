const {ethers} = require('ethers');

export const getCompoundAPY = async (cDaiContract) => {


    
    const ethMantissa = 1e18
    const blocksPerDay = 6570 // 13.15 seconds per block
    const daysPerYear = 365

    const supplyRatePerBlock = await cDaiContract.supplyRatePerBlock()
    const compAPY = ethers.BigNumber.from(((((Math.pow((supplyRatePerBlock / ethMantissa * blocksPerDay) + 1, daysPerYear))) - 1) * 100) * ethMantissa)

    return compAPY
}

export const getAaveAPY = async (AaveLendingPoolContract) => {

    const DAI = '0x6b175474e89094c44da98b954eedeac495271d0f'

    const { currentLiquidityRate } = await AaveLendingPoolContract.getReserveData(DAI)
    const aaveAPY = ethers.BigNumber.from(currentLiquidityRate / 1e7)

    return aaveAPY
}
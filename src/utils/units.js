/**
 * unit conversion
 */
import { BigNumber } from 'bignumber.js'

const conversion = {
  chi2ppcoin: BigNumber('1e-18'),
  ppcoin2chi: BigNumber('1e18'),
}

export const chiToPPCoin = chi => conversion.chi2ppcoin.times(chi)

export const kchiToPPCoin = kchi => conversion.chi2ppcoin.times(kchi).times(1e3)

export const mchiToPPCoin = mchi => conversion.chi2ppcoin.times(mchi).times(1e6)

export const gchiToPPCoin = gchi => conversion.chi2ppcoin.times(gchi).times(1e9)

export const ppcoinToChi = ppcoin => conversion.ppcoin2chi.times(ppcoin)

export const ppcoinToKchi = ppcoin => conversion.ppcoin2chi.times(ppcoin).times(1e-3)

export const ppcoinToMchi = ppcoin => conversion.ppcoin2chi.times(ppcoin).times(1e-6)

export const ppcoinToGchi = ppcoin => conversion.ppcoin2chi.times(ppcoin).times(1e-9)

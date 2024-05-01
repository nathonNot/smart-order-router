import { FeeAmount, Pool } from '@uniswap/v3-sdk';
import JSBI from 'jsbi';
import _ from 'lodash';
import { unparseFeeAmount } from '../../util/amounts';
import { ChainId, WRAPPED_NATIVE_CURRENCY } from '../../util/chains';
import { log } from '../../util/log';
import { BTC_BSC, BUSD_BSC, CELO, CELO_ALFAJORES, CEUR_CELO, CEUR_CELO_ALFAJORES, CUSD_CELO, CUSD_CELO_ALFAJORES, DAI_ARBITRUM, DAI_ARBITRUM_RINKEBY, DAI_BSC, DAI_CELO, DAI_CELO_ALFAJORES, DAI_GÖRLI, DAI_KOVAN, DAI_MAINNET, DAI_MOONBEAM, DAI_OPTIMISM, DAI_OPTIMISM_GOERLI, DAI_OPTIMISTIC_KOVAN, DAI_POLYGON_MUMBAI, DAI_RINKEBY_1, DAI_RINKEBY_2, DAI_ROPSTEN, ETH_BSC, UNI_ARBITRUM_RINKEBY, USDC_ARBITRUM, USDC_ARBITRUM_GOERLI, USDC_BSC, USDC_ETHEREUM_GNOSIS, USDC_GÖRLI, USDC_KOVAN, USDC_MAINNET, USDC_MOONBEAM, USDC_OPTIMISM, USDC_OPTIMISM_GOERLI, USDC_OPTIMISTIC_KOVAN, USDC_POLYGON, USDC_RINKEBY, USDC_ROPSTEN, USDT_ARBITRUM, USDT_ARBITRUM_RINKEBY, USDT_BSC, USDT_GÖRLI, USDT_KOVAN, USDT_MAINNET, USDT_OPTIMISM, USDT_OPTIMISM_GOERLI, USDT_OPTIMISTIC_KOVAN, USDT_RINKEBY, USDT_ROPSTEN, WBTC_ARBITRUM, WBTC_GNOSIS, WBTC_GÖRLI, WBTC_KOVAN, WBTC_MAINNET, WBTC_MOONBEAM, WBTC_OPTIMISM, WBTC_OPTIMISM_GOERLI, WBTC_OPTIMISTIC_KOVAN, WETH_POLYGON, WMATIC_POLYGON, WMATIC_POLYGON_MUMBAI, WXDAI_GNOSIS, } from '../token-provider';
const BASES_TO_CHECK_TRADES_AGAINST = {
    [ChainId.MAINNET]: [
        WRAPPED_NATIVE_CURRENCY[ChainId.MAINNET],
        DAI_MAINNET,
        USDC_MAINNET,
        USDT_MAINNET,
        WBTC_MAINNET,
    ],
    [ChainId.ROPSTEN]: [
        WRAPPED_NATIVE_CURRENCY[ChainId.ROPSTEN],
        DAI_ROPSTEN,
        USDT_ROPSTEN,
        USDC_ROPSTEN,
    ],
    [ChainId.RINKEBY]: [
        WRAPPED_NATIVE_CURRENCY[ChainId.RINKEBY],
        DAI_RINKEBY_1,
        DAI_RINKEBY_2,
        USDC_RINKEBY,
        USDT_RINKEBY,
    ],
    [ChainId.GÖRLI]: [
        WRAPPED_NATIVE_CURRENCY[ChainId.GÖRLI],
        USDT_GÖRLI,
        USDC_GÖRLI,
        WBTC_GÖRLI,
        DAI_GÖRLI,
    ],
    [ChainId.KOVAN]: [
        WRAPPED_NATIVE_CURRENCY[ChainId.KOVAN],
        USDC_KOVAN,
        USDT_KOVAN,
        WBTC_KOVAN,
        DAI_KOVAN,
    ],
    [ChainId.OPTIMISM]: [
        WRAPPED_NATIVE_CURRENCY[ChainId.OPTIMISM],
        USDC_OPTIMISM,
        DAI_OPTIMISM,
        USDT_OPTIMISM,
        WBTC_OPTIMISM,
    ],
    [ChainId.ARBITRUM_ONE]: [
        WRAPPED_NATIVE_CURRENCY[ChainId.ARBITRUM_ONE],
        WBTC_ARBITRUM,
        DAI_ARBITRUM,
        USDC_ARBITRUM,
        USDT_ARBITRUM,
    ],
    [ChainId.ARBITRUM_RINKEBY]: [
        WRAPPED_NATIVE_CURRENCY[ChainId.ARBITRUM_RINKEBY],
        DAI_ARBITRUM_RINKEBY,
        UNI_ARBITRUM_RINKEBY,
        USDT_ARBITRUM_RINKEBY,
    ],
    [ChainId.ARBITRUM_GOERLI]: [
        WRAPPED_NATIVE_CURRENCY[ChainId.ARBITRUM_GOERLI],
        USDC_ARBITRUM_GOERLI,
    ],
    [ChainId.OPTIMISM_GOERLI]: [
        WRAPPED_NATIVE_CURRENCY[ChainId.OPTIMISM_GOERLI],
        USDC_OPTIMISM_GOERLI,
        DAI_OPTIMISM_GOERLI,
        USDT_OPTIMISM_GOERLI,
        WBTC_OPTIMISM_GOERLI,
    ],
    [ChainId.OPTIMISTIC_KOVAN]: [
        WRAPPED_NATIVE_CURRENCY[ChainId.OPTIMISTIC_KOVAN],
        DAI_OPTIMISTIC_KOVAN,
        WBTC_OPTIMISTIC_KOVAN,
        USDT_OPTIMISTIC_KOVAN,
        USDC_OPTIMISTIC_KOVAN,
    ],
    [ChainId.POLYGON]: [USDC_POLYGON, WETH_POLYGON, WMATIC_POLYGON],
    [ChainId.POLYGON_MUMBAI]: [
        DAI_POLYGON_MUMBAI,
        WRAPPED_NATIVE_CURRENCY[ChainId.POLYGON_MUMBAI],
        WMATIC_POLYGON_MUMBAI,
    ],
    [ChainId.CELO]: [CELO, CUSD_CELO, CEUR_CELO, DAI_CELO],
    [ChainId.CELO_ALFAJORES]: [
        CELO_ALFAJORES,
        CUSD_CELO_ALFAJORES,
        CEUR_CELO_ALFAJORES,
        DAI_CELO_ALFAJORES,
    ],
    [ChainId.GNOSIS]: [
        WRAPPED_NATIVE_CURRENCY[ChainId.GNOSIS],
        WBTC_GNOSIS,
        WXDAI_GNOSIS,
        USDC_ETHEREUM_GNOSIS,
    ],
    [ChainId.BSC]: [
        WRAPPED_NATIVE_CURRENCY[ChainId.BSC],
        BUSD_BSC,
        DAI_BSC,
        USDC_BSC,
        USDT_BSC,
        BTC_BSC,
        ETH_BSC,
    ],
    [ChainId.MOONBEAM]: [
        WRAPPED_NATIVE_CURRENCY[ChainId.MOONBEAM],
        DAI_MOONBEAM,
        USDC_MOONBEAM,
        WBTC_MOONBEAM,
    ],
    [ChainId.BITLAYER]: [
        WRAPPED_NATIVE_CURRENCY[ChainId.BITLAYER],
    ],
    [ChainId.BITLAYER_TESTNET]: [
        WRAPPED_NATIVE_CURRENCY[ChainId.BITLAYER_TESTNET],
    ],
    [ChainId.CYBER]: [
        WRAPPED_NATIVE_CURRENCY[ChainId.CYBER],
    ],
    [ChainId.CYBER_TESTNET]: [
        WRAPPED_NATIVE_CURRENCY[ChainId.CYBER_TESTNET],
        DAI_MOONBEAM,
        USDC_MOONBEAM,
        WBTC_MOONBEAM,
    ],
    [ChainId.Linea]: [
        WRAPPED_NATIVE_CURRENCY[ChainId.Linea],
        DAI_MOONBEAM,
        USDC_MOONBEAM,
        WBTC_MOONBEAM,
    ],
    [ChainId.LINEA_SEPOLIA]: [
        WRAPPED_NATIVE_CURRENCY[ChainId.LINEA_SEPOLIA],
        DAI_MOONBEAM,
        USDC_MOONBEAM,
        WBTC_MOONBEAM,
    ],
};
/**
 * Provider that uses a hardcoded list of V3 pools to generate a list of subgraph pools.
 *
 * Since the pools are hardcoded and the data does not come from the Subgraph, the TVL values
 * are dummys and should not be depended on.
 *
 * Useful for instances where other data sources are unavailable. E.g. Subgraph not available.
 *
 * @export
 * @class StaticV3SubgraphProvider
 */
export class StaticV3SubgraphProvider {
    constructor(chainId, poolProvider) {
        this.chainId = chainId;
        this.poolProvider = poolProvider;
    }
    async getPools(tokenIn, tokenOut) {
        log.info('In static subgraph provider for V3');
        const bases = BASES_TO_CHECK_TRADES_AGAINST[this.chainId];
        const basePairs = _.flatMap(bases, (base) => bases.map((otherBase) => [base, otherBase]));
        if (tokenIn && tokenOut) {
            basePairs.push([tokenIn, tokenOut], ...bases.map((base) => [tokenIn, base]), ...bases.map((base) => [tokenOut, base]));
        }
        const pairs = _(basePairs)
            .filter((tokens) => Boolean(tokens[0] && tokens[1]))
            .filter(([tokenA, tokenB]) => tokenA.address !== tokenB.address && !tokenA.equals(tokenB))
            .flatMap(([tokenA, tokenB]) => {
            return [
                [tokenA, tokenB, FeeAmount.LOWEST],
                [tokenA, tokenB, FeeAmount.LOW],
                [tokenA, tokenB, FeeAmount.MEDIUM],
                [tokenA, tokenB, FeeAmount.HIGH],
            ];
        })
            .value();
        log.info(`V3 Static subgraph provider about to get ${pairs.length} pools on-chain`);
        const poolAccessor = await this.poolProvider.getPools(pairs);
        const pools = poolAccessor.getAllPools();
        const poolAddressSet = new Set();
        const subgraphPools = _(pools)
            .map((pool) => {
            const { token0, token1, fee, liquidity } = pool;
            const poolAddress = Pool.getAddress(pool.token0, pool.token1, pool.fee);
            if (poolAddressSet.has(poolAddress)) {
                return undefined;
            }
            poolAddressSet.add(poolAddress);
            const liquidityNumber = JSBI.toNumber(liquidity);
            return {
                id: poolAddress,
                feeTier: unparseFeeAmount(fee),
                liquidity: liquidity.toString(),
                token0: {
                    id: token0.address,
                },
                token1: {
                    id: token1.address,
                },
                // As a very rough proxy we just use liquidity for TVL.
                tvlETH: liquidityNumber,
                tvlUSD: liquidityNumber,
            };
        })
            .compact()
            .value();
        return subgraphPools;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljLXN1YmdyYXBoLXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Byb3ZpZGVycy92My9zdGF0aWMtc3ViZ3JhcGgtcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNsRCxPQUFPLElBQUksTUFBTSxNQUFNLENBQUM7QUFDeEIsT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFDO0FBRXZCLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNyRSxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDckMsT0FBTyxFQUNMLE9BQU8sRUFDUCxRQUFRLEVBQ1IsSUFBSSxFQUNKLGNBQWMsRUFDZCxTQUFTLEVBQ1QsbUJBQW1CLEVBQ25CLFNBQVMsRUFDVCxtQkFBbUIsRUFDbkIsWUFBWSxFQUNaLG9CQUFvQixFQUNwQixPQUFPLEVBQ1AsUUFBUSxFQUNSLGtCQUFrQixFQUNsQixTQUFTLEVBQ1QsU0FBUyxFQUNULFdBQVcsRUFDWCxZQUFZLEVBQ1osWUFBWSxFQUNaLG1CQUFtQixFQUNuQixvQkFBb0IsRUFDcEIsa0JBQWtCLEVBQ2xCLGFBQWEsRUFDYixhQUFhLEVBQ2IsV0FBVyxFQUNYLE9BQU8sRUFDUCxvQkFBb0IsRUFDcEIsYUFBYSxFQUNiLG9CQUFvQixFQUNwQixRQUFRLEVBQ1Isb0JBQW9CLEVBQ3BCLFVBQVUsRUFDVixVQUFVLEVBQ1YsWUFBWSxFQUNaLGFBQWEsRUFDYixhQUFhLEVBQ2Isb0JBQW9CLEVBQ3BCLHFCQUFxQixFQUNyQixZQUFZLEVBQ1osWUFBWSxFQUNaLFlBQVksRUFDWixhQUFhLEVBQ2IscUJBQXFCLEVBQ3JCLFFBQVEsRUFD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
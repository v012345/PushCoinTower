import { CoinTower } from "./prefabs/CoinTower"

export class Const {
    static PhysicsGroup = {
        Default: 1 << 0,
        SawBlade: 1 << 1,
        CoinTower: 1 << 2,
        Coin: 1 << 3,
        Ground: 1 << 4,
        Tractor: 1 << 5,
        DroppedCoin: 1 << 6,
        DomeCoin: 1 << 7,
    }
    static Config = {
        CoinScaleOnCargoBed: 0.77,
    }
}
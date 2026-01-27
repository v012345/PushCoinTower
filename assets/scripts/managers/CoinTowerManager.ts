import { _decorator, Component, instantiate, Node, math, Prefab, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
import { CoinTower } from '../prefabs/CoinTower';
@ccclass('CoinTowerManager')
export class CoinTowerManager extends Component {
    @property(Node)
    coinTowersNode: Node;
    @property(Node)
    domeCoinsNode: Node;
    // @property(CoinTower)
    // CoinTowerRight: CoinTower;
    @property(Prefab)
    coinTowerPrefab: Prefab;
    @property(Prefab)
    coinPrefab: Prefab;
    // @property(Node)
    // Actors: Node;
    // @property
    // CoinTowerNumOfOneSide: number = 20;
    start() {
        this.spawnCoinTowers();
        this.buildCoinDome();
    }

    // update(deltaTime: number) {

    // }
    buildCoinDome() {
        const domeRadius = 20;
        const coinRadius = 1.37;
        let semiArcLength = 2 * Math.PI * domeRadius / 2;
        let circleNum = Math.floor(semiArcLength / (coinRadius * 2) / 2); // 半圆弧上硬币圈数
        for (let i = 0; i < circleNum + 2; i++) {
            let arcLength = 2 * coinRadius * i;
            let theta = arcLength / domeRadius;
            let layerRadius = domeRadius * Math.sin(theta);
            let layerCircumference = 2 * Math.PI * layerRadius;
            // 本层硬币数量
            let coinNum = Math.floor(layerCircumference / (coinRadius * 2));
            // 生成本层硬币
            for (let j = 0; j < coinNum; j++) {
                let angle = (2 * Math.PI / coinNum) * j;
                let x = layerRadius * Math.cos(angle);
                let z = layerRadius * Math.sin(angle);
                let y = domeRadius * Math.cos(theta);
                const polar = new Vec3(x, y, z);
                let coin = instantiate(this.coinPrefab);
                coin.setParent(this.domeCoinsNode);
                coin.setPosition(polar);
                coin.lookAt(this.domeCoinsNode.worldPosition);
                coin.eulerAngles = new Vec3(coin.eulerAngles.x + 90, coin.eulerAngles.y, coin.eulerAngles.z);
                coin.rotate(new Vec3(0, 1, 0), Math.random() * 360);
            }
        }

    }
    spawnCoinTowers() {
        // 左右两边 x 的坐标
        [12.5, -12.5].forEach(x => {
            for (let i = 0; i < 17; i++) {
                const coinTowernode = instantiate(this.coinTowerPrefab);
                const coinTower = coinTowernode.getComponent(CoinTower);
                coinTower.layerNum = 15 + i
                coinTowernode.setParent(this.coinTowersNode);
                coinTowernode.setPosition(new Vec3(
                    x,
                    0,
                    12.14 * i
                ));
            }
        });


        //     const radius = coinTower.getRadius()
        //     const CTS = [this.CoinTowerLeft, this.CoinTowerRight];
        //     for (let ct of CTS) {
        //         const pos = ct.node.getPosition();
        //         for (let i = 1; i < this.CoinTowerNumOfOneSide; i++) {
        //             const node = instantiate(this.CoinTowerPrefab);
        //             node.setParent(this.Actors);     // 或 scene / Canvas  
        //             node.setPosition(new Vec3(
        //                 pos.x + radius * 2 * i,
        //                 pos.y,
        //                 pos.z
        //             ));
        //         }
        //     }
    }
}




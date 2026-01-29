import { _decorator, Component, instantiate, Node, tween, ITriggerEvent, MeshRenderer, Prefab, Collider, Vec3, CylinderCollider, RigidBody } from 'cc';
import { OneLayerOfCoins } from './OneLayerOfCoins';
import { GameGlobal } from '../GameGlobal';
import { AudioManager } from '../PASDK/AudioManager';
import { Tractor } from './Tractor';
import { GameEvent } from '../managers/EventManager';
const { ccclass, property } = _decorator;

@ccclass('CoinTower')
export class CoinTower extends Component {
    @property(Collider)
    collider: Collider;
    @property
    layerNum: number = 15;
    @property
    level: number = 1;
    @property(Prefab)
    oneLayerOfCoins: Prefab;
    hasBePushed: boolean = false;
    coinsNodes: Node[] = [];
    towerIndex: number = 0;
    xPos: number = 0;
    start() {
        GameEvent.on('PushedCoinTower', (towerIndex: number) => {
            if (towerIndex - 5 > this.towerIndex) {
                this.node.destroy();
                // this.node.active = false;
            }
        }, this);
        this.buildTower(this.layerNum);
        this.collider.on('onTriggerEnter', (event: ITriggerEvent) => {

            if (event.otherCollider.node.name == "TractorGearsCollider") {
                let tractor = event.otherCollider.node.getParent().getComponent(Tractor);
                if (!this.hasBePushed && tractor.sawBladeLevel >= this.level) {
                    this.removeCollider();
                    AudioManager.audioStop("TowerCollapse");
                    AudioManager.audioPlay("TowerCollapse", false);
                    this.hasBePushed = true;
                    let i = 0
                    this.coinsNodes.forEach(coins => {
                        i++
                        let j = 8;
                        if (this.towerIndex <= 0) {
                            j = 0;
                        }
                        if (i >= j) {
                            coins.getComponent(OneLayerOfCoins).scatter(this.xPos);
                        } else {
                            tween(coins)
                                .to(0.5, { position: new Vec3(0, -6, 0) })
                                .call(() => {
                                    coins.destroy();
                                })
                                .start();
                        }
                    });
                }
            }
        }, this);
    }

    update(deltaTime: number) {

    }
    removeCollider() {
        this.node.getComponent(RigidBody)?.destroy();
        this.node.getComponent(CylinderCollider)?.destroy();
    }
    buildTower(layerNum: number) {
        if (this.towerIndex == 0) {
            this.removeCollider();
        }
        // 至少15层
        for (let i = 0; i < layerNum; i++) {
            const coins = instantiate(this.oneLayerOfCoins);
            coins.setParent(this.node);
            coins.getComponent(OneLayerOfCoins).towerIndex = this.towerIndex;
            coins.setPosition(new Vec3(0, 0.9 * i + 1, 0));
            if (i % 2 == 0) {
                coins.setRotationFromEuler(0, 30, 0);
            }
            if (i < layerNum - 7) {
                //优化后面看不到的硬币层
                // coins.destroy();

                if (i % 2 != 0) {
                    coins.children.forEach(coin => {
                        // console.log(coin.position.z);
                        if (coin.position.z > 0)
                            coin.destroy();
                    });
                } else {
                    coins.children.forEach(coin => {
                        // console.log(coin.position.z);
                        if (coin.position.z > 2)
                            coin.destroy();
                    });
                }
            }
        }
        this.coinsNodes = this.node.children.filter(
            n => n.getComponent(OneLayerOfCoins) !== null
        );
    }


}



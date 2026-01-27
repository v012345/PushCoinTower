import { _decorator, Component, instantiate, Node, tween, ITriggerEvent, MeshRenderer, Prefab, Collider, Vec3 } from 'cc';
import { OneLayerOfCoins } from './OneLayerOfCoins';
import { GameGlobal } from '../GameGlobal';
import { AudioManager } from '../PASDK/AudioManager';
import { Tractor } from './Tractor';
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

    start() {
        this.buildTower(this.layerNum);
        this.collider.on('onTriggerEnter', (event: ITriggerEvent) => {

            if (event.otherCollider.node.name == "TractorGearsCollider") {
                let tractor = event.otherCollider.node.getParent().getComponent(Tractor);
                if (!this.hasBePushed && tractor.sawBladeLevel >= this.level) {
                    AudioManager.audioStop("TowerCollapse");
                    AudioManager.audioPlay("TowerCollapse", false);
                    this.hasBePushed = true;
                    this.coinsNodes.forEach(coins => {
                        coins.getComponent(OneLayerOfCoins).scatter();
                        this.removeBase();
                    });
                }
            }
        }, this);
    }

    update(deltaTime: number) {

    }
    buildTower(layerNum: number) {
        // 至少15层
        for (let i = 0; i < layerNum - 15; i++) {
            const coins = instantiate(this.oneLayerOfCoins);
            coins.setParent(this.node);
            coins.setPosition(new Vec3(0, 8.66 + 0.66 * i + 0.66, 0));
            if (i % 2 == 0) {
                coins.setRotationFromEuler(0, 30, 0);
            }
            this.level = GameGlobal.levelMap[i + 1] || 1;
        }
        this.coinsNodes = this.node.children.filter(
            n => n.getComponent(OneLayerOfCoins) !== null
        );
    }
    removeBase() {
        const base = this.node.getChildByName("Base");
        if (base) {
            tween(base)
                .to(0.5, { position: new Vec3(0, -6, 0) })
                .call(() => {
                    base.destroy();
                })
                .start();
        }
    }


    getRadius(): number {
        // const trigger = this.node.getChildByName("TriggerArea");
        // const mr  = trigger.getComponent(MeshRenderer);
        // const size = mr.mesh.getBoundingBox().getSize();
        // return size.x;
        return 5;
    }
}



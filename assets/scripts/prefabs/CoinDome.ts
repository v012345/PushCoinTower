import { _decorator, Component, v3, CylinderCollider, RigidBody, ConstantForce, Node, Collider, ITriggerEvent, PhysicsGroup, Game, Vec3 } from 'cc';
import { Coin } from './Coin';
import { AudioManager } from '../PASDK/AudioManager';
import { GameEvent } from '../managers/EventManager';
import { EventEnum } from '../Event/EventEnum';
import { Const } from '../Const';
import { GameGlobal } from '../GameGlobal';
const { ccclass, property } = _decorator;

@ccclass('CoinDome')
export class CoinDome extends Component {
    @property(Collider)
    collider: Collider;
    @property(Node)
    coins: Node;
    onload() {

    }
    start() {
        this.coins.children.forEach(coin => {
            coin.addComponent(Coin)
        })
        this.collider.on('onTriggerEnter', (event: ITriggerEvent) => {
            if (event.otherCollider.node.name == "TractorGearsCollider") {
                this.collapse();
            }
        }, this);
    }

    collapse() {
        GameEvent.emit(EventEnum.DomeBeCollided);
        AudioManager.audioPlay("DomeCollapse", false);
        this.scheduleOnce(() => {
            GameEvent.emit(EventEnum.DomeCollapse);
        }, 1);
        // this.coins.children.forEach(coin => {
        //     coin.getComponent(Coin).addPyhsics();
        //     coin.getComponent(Coin).rigidBody.applyImpulse(v3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5));
        //     coin.getComponent(Coin).constantForce.force = new Vec3(0, -9.8 * 9, 0);
        // })
        let i = 0;
        let j = 3;
        GameGlobal.DomeCoinsofLayers.forEach(layer => {
            if (i > j) {
                this.scheduleOnce(() => {
                    layer.forEach(coin => {
                        coin.addPyhsics();
                        coin.rigidBody.applyImpulse(v3(Math.random() * 10 - 5, Math.random() * 10 - 30, Math.random() * 10 - 5));
                        coin.constantForce.force = new Vec3(0, -9.8 * 10, 0);
                    });
                }, (i - j) * 0.2);
            } else {
                layer.forEach(coin => {
                    let o = v3(0, 15, 195);
                    let a = coin.node.worldPosition.clone();
                    let force = a.subtract(o).normalize().multiplyScalar(50);
                    coin.addPyhsics();

                    coin.rigidBody.applyImpulse(force);
                    coin.constantForce.force = new Vec3(0, -9.8 * 10, 0);
                });
            }
            i++;
        });
    }

    update(deltaTime: number) {

    }
}



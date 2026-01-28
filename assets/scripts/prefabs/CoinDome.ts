import { _decorator, Component, v3, CylinderCollider, RigidBody, ConstantForce, Node, Collider, ITriggerEvent, PhysicsGroup, Game } from 'cc';
import { Coin } from './Coin';
import { AudioManager } from '../PASDK/AudioManager';
import { GameEvent } from '../managers/EventManager';
import { EventEnum } from '../Event/EventEnum';
import { Const } from '../Const';
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
        AudioManager.audioPlay("DomeCollapse", false);
        GameEvent.emit(EventEnum.DomeCollapse);
        this.coins.children.forEach(coin => {
            let collider = coin.addComponent(CylinderCollider);
            let rb = coin.addComponent(RigidBody);

            let cf = coin.addComponent(ConstantForce);
            collider.radius = 1.7;
            collider.height = 0.7;
            collider.center = v3(0, 0.4, 0);
            rb.useGravity = true;
            cf.force = v3(0, -9.8 * 9, 0);
            collider.setGroup(Const.PhysicsGroup.Coin);
            collider.setMask(Const.PhysicsGroup.Coin | Const.PhysicsGroup.DroppedCoin | Const.PhysicsGroup.Ground | Const.PhysicsGroup.Tractor);

            rb.applyImpulse(v3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5));
        })
    }

    update(deltaTime: number) {

    }
}



import { _decorator, Component, CylinderCollider, Node, PhysicsGroup, RigidBody, Vec3 } from 'cc';
import { Coin } from './Coin';
const { ccclass, property } = _decorator;

@ccclass('OneLayerOfCoins')
export class OneLayerOfCoins extends Component {
    start() {

    }

    update(deltaTime: number) {

    }
    scatter() {
        this.node.children.forEach(coin => {

            const rb = coin.getComponent(Coin);
            rb.drop(false);
        });
    }
}



import { _decorator, Component, CylinderCollider, Node, PhysicsGroup, RigidBody, Vec3 } from 'cc';
import { Coin } from './Coin';
const { ccclass, property } = _decorator;

@ccclass('OneLayerOfCoins')
export class OneLayerOfCoins extends Component {
    towerIndex: number = 0;
    start() {
        this.node.children.forEach(coin => {
            let c = coin.getComponent(Coin);
            c.towerIndex = this.towerIndex;
        });
    }

    update(deltaTime: number) {

    }
    scatter(xPos: number) {
        this.node.children.forEach(coin => {

            const rb = coin.getComponent(Coin);
            rb.drop(xPos);
        });
    }
}



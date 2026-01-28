import { _decorator, Component, Node, tween, ConstantForce, PhysicsSystem, RigidBody, v3, Vec3, PhysicsGroup, CylinderCollider, ICollisionEvent } from 'cc';
import { GameGlobal } from '../GameGlobal';
import { Const } from '../Const';
import { Utils } from '../Utils';
const { ccclass, property } = _decorator;

@ccclass('Coin')
export class Coin extends Component {
    isDropped: boolean = false;
    canUse: boolean = true;
    index: number = 0;
    start() {

    }



    update(deltaTime: number) {
        if (this.isDropped) {
            let p1 = this.node.worldPosition.clone();
            let p2 = GameGlobal.Tractor.cargoBed.worldPosition.clone();
            p1.y = 0;
            p2.y = 0;
            if (p1.z < p2.z && Vec3.distance(p1, p2) > 40) {
                this.removePhysics();
                this.canUse = false;
                GameGlobal.CoinsPool.delete(this);
                this.node.destroy();
                // this.node.position.y = 100
            }
        }

    }
    addPyhsics() {
        let collider = this.node.addComponent(CylinderCollider);
        let rb = this.node.addComponent(RigidBody);
        let cf = this.node.addComponent(ConstantForce);
        collider.radius = 1.7;
        collider.height = 0.7;
        collider.center = v3(0, 0.4, 0);
        rb.useGravity = false;
        cf.force = new Vec3(0, -9.8 * 5, 0);
        collider.setGroup(Const.PhysicsGroup.Coin);
        collider.setMask(Const.PhysicsGroup.Coin | Const.PhysicsGroup.DroppedCoin | Const.PhysicsGroup.Ground | Const.PhysicsGroup.Tractor);
        collider.on('onCollisionEnter', this.onCollisionEnter, this);
    }
    drop(isDome: boolean) {
        this.addPyhsics();
        let rb = this.node.getComponent(RigidBody);
        rb.applyImpulse(new Vec3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5));


    }
    removePhysics() {
        this.node.getComponent(CylinderCollider)?.destroy();
        this.node.getComponent(RigidBody)?.destroy();
        this.node.getComponent(ConstantForce)?.destroy();
    }
    onDestroy() {
        // console.log("onDestroy");

    }

    onCollisionEnter(event: ICollisionEvent) {
        const other = event.otherCollider;
        if (other.node.name == "Ground") {
            let collider = this.node.getComponent(CylinderCollider);
            collider.off('onCollisionEnter', this.onCollisionEnter, this);
            this.isDropped = true;
            this.node.getComponent(ConstantForce).destroy();
            // this.index = GameGlobal.CoinsPool.length;
            GameGlobal.CoinsPool.add(this);

            // const it = mySet.values().next();
            // if (!it.done) {
            //     const value = it.value;
            //     mySet.delete(value);
            // }


        } else if (other.node.name == "Tractor") {

        } else if (other.node.name == "Coin") {
            let rb = other.node.getComponent(RigidBody);
            let group = rb.getGroup();
            if (group == Const.PhysicsGroup.DroppedCoin) {
                let collider = this.node.getComponent(CylinderCollider);
                collider.setGroup(Const.PhysicsGroup.DroppedCoin);
                collider.setMask(Const.PhysicsGroup.Coin | Const.PhysicsGroup.DroppedCoin | Const.PhysicsGroup.Ground | Const.PhysicsGroup.Tractor);
                this.node.getComponent(ConstantForce).destroy();
                collider.off('onCollisionEnter', this.onCollisionEnter, this);
                this.isDropped = true;
            }

        }
    }

    flyTo(where: Node) {
        const originalWorldPos = this.node.worldPosition.clone();

        this.node.setParent(where);
        this.node.setScale(new Vec3(2.6, 2.6, 2.6));
        this.node.worldPosition = originalWorldPos;
        const start = this.node.position.clone();   // P0
        const end = new Vec3(0, 0, 0);               // P2

        // 控制点（P1）
        const control = start.clone().add(end).multiplyScalar(0.5);
        control.y += Math.random() * 10 + 15;
        this.node.eulerAngles = new Vec3(
            Math.random() * 360,
            Math.random() * 360,
            Math.random() * 360
        );
        tween(this.node).to(0.5, {}, {
            onUpdate: (_, ratio) => {
                Utils.bezierCurve(ratio, start, control, end, this.node.position);
                const startScale = 1;
                const endScale = Const.Config.CoinScaleOnCargoBed;
                const scaleValue = startScale + (endScale - startScale) * ratio;
                this.node.setScale(new Vec3(scaleValue, scaleValue, scaleValue));
            }
        }).call(() => {
            GameGlobal.Tractor.arrangeCoin(this.node);
        }).start();

    }
}



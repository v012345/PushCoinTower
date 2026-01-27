import { _decorator, Component, Node, tween, PhysicsSystem, RigidBody, v3, Vec3, PhysicsGroup, CylinderCollider, ICollisionEvent } from 'cc';
import { GameGlobal } from '../GameGlobal';
import { Const } from '../Const';
const { ccclass, property } = _decorator;

@ccclass('Coin')
export class Coin extends Component {
    isDropped: boolean = false;
    start() {

    }

    update(deltaTime: number) {
        if (this.isDropped) {
            let p1 = this.node.worldPosition.clone();
            let p2 = GameGlobal.Tractor.cargoBed.worldPosition.clone();
            p1.y = 0;
            p2.y = 0;
            if (p1.z < p2.z && Vec3.distance(p1, p2) > 30) {
                this.node.getComponent(CylinderCollider)?.destroy();
                this.node.getComponent(RigidBody)?.destroy();
            }
        }

    }
    drop(isDome: boolean) {
        if (this.isDropped) {
            const rb = this.node.addComponent(RigidBody);
            rb.setGroup(Const.PhysicsGroup.Coin);
            rb.setMask(Const.PhysicsGroup.Coin | Const.PhysicsGroup.Ground | Const.PhysicsGroup.Tractor);

            rb.mass = 0.3;
            // PhysicsSystem.instance.gravity = new Vec3(0, -30, 0);
            rb.useGravity = true;
            // rb.gravityScale = 100;   // 重力放大 2 倍
            let f = this.node.position.clone().subtract(new Vec3(0, Math.random() * 3 + 2, 0)).normalize()
            // rb.applyForce(new Vec3(20,20,20), this.node.getWorldPosition());
            rb.applyImpulse(f.multiplyScalar(Math.random() * 5 + 3));
            rb.applyForce(new Vec3(0, Math.random() * 25 - 5, 0), this.node.getWorldPosition());
            // this.scheduleOnce(() => { rb.applyImpulse(new Vec3(0, -2, 0)); }, 0.5)
        } else {
            const rb = this.node.addComponent(RigidBody);
            rb.setGroup(Const.PhysicsGroup.Coin);
            rb.setMask(Const.PhysicsGroup.Coin | Const.PhysicsGroup.Ground | Const.PhysicsGroup.Tractor);

            rb.mass = 0.3;
            // PhysicsSystem.instance.gravity = new Vec3(0, -30, 0);
            rb.useGravity = true;
            // rb.gravityScale = 100;   // 重力放大 2 倍
            let f = this.node.position.clone().subtract(new Vec3(0, Math.random() * 3 + 2, 0)).normalize()
            // rb.applyForce(new Vec3(20,20,20), this.node.getWorldPosition());
            rb.applyImpulse(f.multiplyScalar(Math.random() * 5 + 3));
            rb.applyForce(new Vec3(0, Math.random() * 25 - 5, 0), this.node.getWorldPosition());
            // this.scheduleOnce(() => { rb.applyImpulse(new Vec3(0, -2, 0)); }, 0.5)
        }

        const collider = this.node.addComponent(CylinderCollider);
        collider.radius = 1.311;
        collider.height = 0.7;
        collider.on('onCollisionEnter', this.onCollisionEnter, this);
    }
    onCollisionEnter(event: ICollisionEvent) {
        const other = event.otherCollider;
        // console.log(other)
        if (other.node.name == "Ground") {
            // console.log('Coin landed on the ground');
            const collider = this.node.getComponent(CylinderCollider);
            collider.off('onCollisionEnter', this.onCollisionEnter, this);
            // const rb = this.node.getComponent(RigidBody);
            // rb.setGroup(Const.PhysicsGroup.DroppedCoin);
            // rb.setMask(Const.PhysicsGroup.DroppedCoin | Const.PhysicsGroup.Ground);
            this.isDropped = true;
            GameGlobal.CoinsPool.push(this);
            // this.scheduleOnce(() => {
            //     // this.flyToCargoBed();
            //     GameGlobal.CoinsPool.push(this);
            // }, 0.5);
        } else if (other.node.name == "Tractor") {
            // 避免与拖拉机碰撞时反弹
            // const collider = this.node.getComponent(CylinderCollider);
            // collider.off('onCollisionEnter', this.onCollisionEnter, this);
            // this.isDropped = true;
            // GameGlobal.CoinsPool.push(this);
            const rb = this.node.getComponent(RigidBody);
            const f = this.node.position.clone().subtract(other.node.worldPosition).normalize();
            rb.applyImpulse(f.multiplyScalar(Math.random() * 5 + 3));
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
                this.bezierCurve(ratio, start, control, end, this.node.position);

                // scale 从 2.6 -> 1
                const startScale = 2.6;
                const endScale = 1.3;
                const scaleValue = startScale + (endScale - startScale) * ratio;

                this.node.setScale(new Vec3(scaleValue, scaleValue, scaleValue));
            }
        }).call(() => {
            GameGlobal.Tractor.arrangeCoin(this.node);
        }).start();

    }

    bezierCurve(t: number, p1: Vec3, cp: Vec3, p2: Vec3, out: Vec3) {
        out.x = (1 - t) * (1 - t) * p1.x + 2 * t * (1 - t) * cp.x + t * t * p2.x;
        out.y = (1 - t) * (1 - t) * p1.y + 2 * t * (1 - t) * cp.y + t * t * p2.y;
        out.z = (1 - t) * (1 - t) * p1.z + 2 * t * (1 - t) * cp.z + t * t * p2.z;
    }
}



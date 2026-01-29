import { _decorator, Component, Node, tween, ConstantForce, PhysicsSystem, RigidBody, v3, Vec3, PhysicsGroup, CylinderCollider, ICollisionEvent, math } from 'cc';
import { GameGlobal } from '../GameGlobal';
import { Const } from '../Const';
import { Utils } from '../Utils';
import { GameEvent } from '../managers/EventManager';
import { EventEnum } from '../Event/EventEnum';
const { ccclass, property } = _decorator;

@ccclass('Coin')
export class Coin extends Component {
    isDropped: boolean = false;
    canUse: boolean = true;
    towerIndex: number = -1;
    hasPhysics: boolean = true;
    rigidBody: RigidBody = null;
    collider: CylinderCollider = null;
    constantForce: ConstantForce = null;
    start() {
    }
    update(deltaTime: number) { }

    addPyhsics() {
        this.collider = this.node.addComponent(CylinderCollider);
        this.rigidBody = this.node.addComponent(RigidBody);
        this.constantForce = this.node.addComponent(ConstantForce);
        this.collider.radius = 1.7;
        this.collider.height = 0.7;
        this.collider.center = v3(0, 0.4, 0);
        this.rigidBody.useGravity = false;
        this.constantForce.force = new Vec3(0, -9.8 * 5, 0);
        this.collider.setGroup(Const.PhysicsGroup.Coin);
        this.collider.setMask(Const.PhysicsGroup.Coin | Const.PhysicsGroup.DroppedCoin | Const.PhysicsGroup.Ground | Const.PhysicsGroup.Tractor);
        this.collider.on('onCollisionEnter', this.onCollisionEnter, this);
        GameEvent.on(EventEnum.PushedCoinTower, (towerIndex: number) => {
            if (this.towerIndex < towerIndex - 2) {
                this.rigidBody.type = RigidBody.Type.STATIC;
            }
        }, this);
        GameEvent.on(EventEnum.DomeCollapse, () => {
            this.scheduleOnce(() => {
                this.rigidBody.type = RigidBody.Type.STATIC;
            }, 5);
        }, this);
    }
    drop() {
        this.addPyhsics();
        let i = 0
        if (this.node.worldPosition.y > 8) {

            i = 60 / Math.pow(this.node.worldPosition.y, 2);
        }
        this.rigidBody.applyImpulse(new Vec3(Math.random() * 10 - 5, Math.random() * 10 - 5, 10 + i * 8));

    }
    removePhysics() {
        this.collider?.destroy();
        this.rigidBody?.destroy();
        this.constantForce?.destroy();
    }

    onCollisionEnter(event: ICollisionEvent) {
        const other = event.otherCollider;
        if (other.node.name == "Ground" || other.node.name == "Coin") {
            let rb = other.node.getComponent(RigidBody);
            let group = rb.getGroup();
            if (group == Const.PhysicsGroup.DroppedCoin) {
                let collider = this.node.getComponent(CylinderCollider);
                collider.setGroup(Const.PhysicsGroup.DroppedCoin);
                collider.setMask(Const.PhysicsGroup.Coin | Const.PhysicsGroup.DroppedCoin | Const.PhysicsGroup.Ground | Const.PhysicsGroup.Tractor);
                // this.constantForce.destroy();
                collider.off('onCollisionEnter', this.onCollisionEnter, this);
                this.isDropped = true;
                if (this.towerIndex >= 0) {
                    GameGlobal.DroppedCoinsPool[this.towerIndex].push(this);
                }
            } else {
                if (other.node.name == "Ground") {
                    let collider = this.node.getComponent(CylinderCollider);
                    collider.off('onCollisionEnter', this.onCollisionEnter, this);
                    this.isDropped = true;
                    // this.constantForce.destroy();
                    if (this.towerIndex >= 0) {
                        GameGlobal.DroppedCoinsPool[this.towerIndex].push(this);
                    }
                    collider.setGroup(Const.PhysicsGroup.DroppedCoin);
                    collider.setMask(Const.PhysicsGroup.Coin | Const.PhysicsGroup.DroppedCoin | Const.PhysicsGroup.Ground | Const.PhysicsGroup.Tractor);
                }
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



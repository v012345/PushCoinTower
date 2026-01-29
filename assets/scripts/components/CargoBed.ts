import { _decorator, Component, math, Node, Quat, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CargoBed')
export class CargoBed extends Component {
    lastPosZ: number = 0;
    speedZ: number = 0;
    start() {
        this.lastPosZ = this.node.worldPosition.z;
    }

    update(deltaTime: number) {
        let currentPosZ = this.node.worldPosition.z;
        this.speedZ = (currentPosZ - this.lastPosZ) / deltaTime;
        this.lastPosZ = currentPosZ;
        this.node.children.forEach(item => {
            if (!item.oz) {
                item.oz = item.position.z;
            }
            this.applyDynamicInclineToItem(item, deltaTime)
        })

    }
    maxInclineAngle = 30; // 最大倾斜角度
    private applyDynamicInclineToItem(item: Node, dt: number): void {

        const lerpFactor = Math.min(5.0 * dt, 1.0);

        const height = item.position.y - 0.3;
        const sign = Math.sign(this.speedZ);

        // Z 偏移（稳定）
        const t = height / 20;
        const targetZOffset = -sign * t * t * 6;
        // const targetZOffset = item.oz;

        // 位置（只 lerp Z）
        // const pos = item.position.clone();
        // pos.z = math.lerp(pos.z, targetZOffset, lerpFactor);
        // item.setPosition(pos);
        const targetPosition = new Vec3(
            item.position.x,
            item.position.y,
            targetZOffset
        );
        const currentPosition = item.position.clone();
        Vec3.lerp(currentPosition, currentPosition, targetPosition, lerpFactor);
        item.setPosition(currentPosition);

        // 旋转（跟高度走）
        const angle = t * 40 * sign;
        const targetRotation = new Quat();
        Quat.fromEuler(targetRotation, -angle, 0, 0);

        const rot = item.rotation.clone();
        Quat.slerp(rot, rot, targetRotation, lerpFactor);
        item.setRotation(rot);
    }
}



import { math, UIOpacity, UITransform } from 'cc';
import { _decorator, Component, Node, Vec3 } from 'cc';
import { GameGlobal } from '../GameGlobal';
import { Camera } from 'cc';
import { tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Coin2D')
export class Coin2D extends Component {

    start() {

    }

    update(deltaTime: number) {

    }
    getUIPositionInCanvas(uiNode: Node, canvas: Node): Vec3 | null {
        if (!uiNode) {
            console.warn("UI节点不能为空");
            return null;
        }
        // 获取UI节点的世界坐标
        const worldPos = new Vec3();
        uiNode.getWorldPosition(worldPos);

        // 将世界坐标转换为Canvas的局部坐标
        const canvasPos = new Vec3();
        Vec3.transformMat4(canvasPos, worldPos, canvas.worldMatrix.clone().invert());

        return canvasPos;
    }
    Vec3Lerp(a: Vec3, b: Vec3, t: number): Vec3 {
        let out = new Vec3();
        // 确保 t 在 0-1 范围内
        t = math.clamp01(t);

        // 对每个分量进行插值
        out.x = a.x + (b.x - a.x) * t;
        out.y = a.y + (b.y - a.y) * t;
        out.z = a.z + (b.z - a.z) * t;

        return out;
    }
    flyToCoinNode(index: number, from: Node, toWhere: Node) {
        const petNode = GameGlobal.MainCamera.getComponent(Camera).convertToUINode(from.getWorldPosition(), GameGlobal.UILayer)
        const RelayPoint = this.Vec3Lerp(petNode, this.getUIPositionInCanvas(toWhere, GameGlobal.UILayer), 0.1)
        const flyPos: Vec3[] = [RelayPoint.clone().add(new Vec3(-50, 50, 0)), RelayPoint.clone().add(new Vec3(0, 50, 0)), RelayPoint.clone().add(new Vec3(50, 50, 0))]
        this.node.setParent(GameGlobal.UILayer)


        let touchPos = toWhere.getWorldPosition();
        let uiTransform = GameGlobal.UILayer.getComponent(UITransform);
        let joyStickPos = uiTransform.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));

        this.node.scale = new Vec3(0.4, 0.4, 0.4);
        this.node.setPosition(petNode)
        this.fly2DCoin(flyPos[index % 3], 0.2, () => {
            this.fly2DCoin(joyStickPos, 0.6, () => { }, true)
        })

    }
    fly2DCoin(pos: Vec3, time: number = 0.7, callback = () => { }, isDestory: boolean = false) {
        tween(this.node)
            .to(time, { position: pos }, { easing: 'smooth' })
            .call(() => {
                callback && callback()
                if (isDestory) {
                    this.scheduleOnce(() => {
                        this.node.destroy()
                    },)
                }
            })
            .start()
    }
}



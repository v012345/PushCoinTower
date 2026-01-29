import { _decorator, Vec3, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Utils')
export class Utils {
    /**
     * Calculates a point on a quadratic Bezier curve at a given ratio.
     * @param ratio number between 0 and 1 representing the position along the curve
     * @param from Vec3 representing the starting point
     * @param controlPoint Vec3 representing the control point
     * @param to Vec3 representing the ending point
     * @returns Vec3 representing the point on the Bezier curve at the given ratio
     */
    public static bezierCurve(ratio: number, from: Vec3, controlPoint: Vec3, to: Vec3, out?: Vec3): Vec3 {
        let x = (1 - ratio) * (1 - ratio);
        let y = 2 * ratio * (1 - ratio);
        let z = ratio * ratio;
        if (out) {
            out.x = x * from.x + y * controlPoint.x + z * to.x;
            out.y = x * from.y + y * controlPoint.y + z * to.y;
            out.z = x * from.z + y * controlPoint.z + z * to.z;
            return out;
        } else {
            return new Vec3(
                x * from.x + y * controlPoint.x + z * to.x,
                x * from.y + y * controlPoint.y + z * to.y,
                x * from.z + y * controlPoint.z + z * to.z
            );
        }
    }

    public static breathEffect(node: Node) {
        tween(node).repeatForever(
            tween(node)
                .by(0.8, { scale: v3(0.05, 0.05, 0) }, { easing: 'quadInOut' })
                .by(0.8, { scale: v3(-0.05, -0.05, 0) }, { easing: 'quadInOut' })
        ).start();
    }

    public static jellyEffect(node: Node, t: number) {
        node.setScale(Vec3.ZERO);
        tween(node)
            .to(0.15, { scale: v3(1 * t, 1 * t, 1 * t) })
            .to(.06, { scale: v3(1.4 * t, 0.53 * t, 1 * t) })
            .to(.12, { scale: v3(0.8 * t, 1.2 * t, 1 * t) })
            .to(.07, { scale: v3(1.2 * t, 0.7 * t, 1 * t) })
            .to(.07, { scale: v3(.85 * t, 1.1 * t, 1 * t) })
            .to(.07, { scale: v3(1 * t, 1 * t, 1 * t) })
            .start();
    }

    public static BtnEffect(node: Node, t: number) {
        node.setScale(Vec3.ZERO);
        tween(node)
            .to(0.15, { scale: v3(1 * t, 1 * t, 1 * t) })
            .to(.06, { scale: v3(1.4 * t, 0.8 * t, 1 * t) })
            .to(.12, { scale: v3(0.8 * t, 1.2 * t, 1 * t) })
            .to(.07, { scale: v3(1.2 * t, 0.7 * t, 1 * t) })
            .to(.07, { scale: v3(.85 * t, 1.1 * t, 1 * t) })
            .to(.07, { scale: v3(1 * t, 1 * t, 1 * t) })
            .start();
    }


}





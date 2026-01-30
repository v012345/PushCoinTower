import { _decorator, CCFloat, Component, Material, Node, Sprite, tween, v3, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ButtonFlashLight')
export class ButtonFlashLight extends Component {
    // @property(Sprite)
    sprite: Sprite;

    /**光束宽度 */
    @property({ type: CCFloat, tooltip: "光束宽度" })
    lightWidth = 0.2;

    /**时间 */
    @property({ type: CCFloat, tooltip: "时间" })
    LoopTime = 1.0;

    /**TimeInterval */
    @property({ type: CCFloat, tooltip: "TimeInterval" })
    TimeInterval = 3.0;

    @property
    openBreathLight: boolean = false;

    /**记录时间 */
    private time: number = 0;
    /**精灵上的材质 */
    private material: Material = null!;

    private startPos = 0;
    private moveLength = 0;

    private Speed = 0;

    private dttime = 0;

    start() {

        this.sprite = this.getComponent(Sprite);
        this.time = 0;
        this.dttime = 0;
        this.material = this.sprite.getSharedMaterial(0)!;   //获取材质 
        this.startPos = -this.lightWidth / 2;
        this.moveLength = this.lightWidth + 1;
        this.Speed = this.moveLength / this.LoopTime;
        this.time = this.startPos;

        if (this.openBreathLight) this.breathLightEffect(this.node);
    }

    //呼吸效果

    public breathLightEffect(node: Node) {
        tween(node).repeatForever(
            tween(node)
                .by(1, { scale: v3(0.05, 0.05, 0) }, { easing: 'sineOut' })
                .by(1, { scale: v3(-0.05, -0.05, 0) }, { easing: 'sineOut' })
        ).start();
    }

    update(dt: number) {

        this.time += dt * this.Speed;
        this.dttime += dt;
        this.material.setProperty("lightCenterPoint", new Vec2(this.time, this.time));          //设置材质对应的属性

        if (this.dttime > this.LoopTime + this.TimeInterval) {
            this.time = this.startPos;
            this.dttime = 0;
        }
    }
}



import { _decorator, Component, Node, view, screen, ResolutionPolicy, game, tween, Vec3, Tween, Enum, Asset } from 'cc';
import { UIAdjust, UIAdjustType } from './UIAdjust';
const { ccclass, property } = _decorator;

export enum ScreenType {
    "手机竖屏",
    "手机横屏",
    "平板竖屏",
    "平板横屏"
}

export enum GuideType {
    "无引导",
    "长按",
    "短按"
}

export enum EndCardType {
    "A版",
    "B版",
}


@ccclass('Vm3ViewController')
export class Vm3ViewController extends Component {

    @property({ type: Enum(GuideType), displayName: "引导类型" })
    guideType: GuideType = GuideType.无引导;

    @property({ type: Enum(EndCardType), displayName: "尾卡样式" })
    endcardType: EndCardType = EndCardType.A版;

    @property(Node)
    tipNode: Node = null;

    @property(Node)
    logoRootNode: Node = null;

    @property(Node)
    AnimNode: Node = null;

    @property(Node)
    longTouchGuideNode: Node = null;

    @property(Node)
    shortTouchGuideNode: Node = null;

    @property(Node)
    endCardNode: Node = null;

    @property(Node)
    successANode: Node = null;

    @property(Node)
    failANode: Node = null;

    @property(Node)
    successBNode: Node = null;

    @property(Node)
    failBNode: Node = null;

    private screenType: ScreenType = null; // 屏幕类型
    private orgTipScale: Vec3 = null;

    onLoad() {
        window["vm3ViewController"] = this; // 挂载到全局这里可以改成 GameGlobal.vm3ViewController = this; 为了解耦没这么写
    }

    start() {
        this.initResize();
        this.orgTipScale = this.tipNode.scale;
        this.scaleTween(this.tipNode);
    }

    //用tween做一个缩放动画
    scaleTween(node: Node) {
        if (!node) return;
        Tween.stopAllByTarget(node);
        const originalScale = this.orgTipScale;
        node.scale = this.orgTipScale;
        // 创建弹性缩放动画
        tween(node)
            .to(0.3, { scale: new Vec3(originalScale.x * 0.95, originalScale.y * 0.95, 1) })
            .to(0.4, { scale: new Vec3(originalScale.x * 1.05, originalScale.y * 1.05, 1) })
            .to(0.3, { scale: originalScale })
            .delay(1)
            .union()
            .repeatForever()
            .start();
    }

    /**
     * 初始化屏幕尺寸变化监听
     */
    initResize() {
        view.on("canvas-resize", this.resize, this);
        this.scheduleOnce(() => {
            this.resize();
        });
    }

    /**
     * 屏幕尺寸变化处理
     */
    resize(e?) {
        let isPad: boolean = this.detectIPad();
        if (screen.windowSize.height > screen.windowSize.width && screen.windowSize.width / screen.windowSize.height < 1) {
            view.setResolutionPolicy(ResolutionPolicy.FIXED_WIDTH);
            isPad ? this.screenType = ScreenType.平板竖屏 : this.screenType = ScreenType.手机竖屏;
        } else {
            view.setResolutionPolicy(ResolutionPolicy.FIXED_HEIGHT);
            isPad ? this.screenType = ScreenType.平板横屏 : this.screenType = ScreenType.手机横屏;
        }
        let p: UIAdjustType = null;
        switch (this.screenType) {
            case ScreenType.手机竖屏:
                p = UIAdjustType.竖屏;
                break;
            case ScreenType.手机横屏:
                p = UIAdjustType.横屏;
                break;
            case ScreenType.平板竖屏:
            case ScreenType.平板横屏:
                p = UIAdjustType.方块屏;
                break;
            default:
                break;
        }

        this.node.getComponentsInChildren(UIAdjust).forEach(uiAdjust => {
            uiAdjust.type = p;
        });

        game.emit("resize"); //将此事件发送出去，留口给其他模块监听
    }

    /**
     * 检测是否是iPad机型
     */
    private detectIPad(): boolean {
        // 获取屏幕尺寸
        const screenWidth = screen.windowSize.width;
        const screenHeight = screen.windowSize.height;
        const aspectRatio = Math.max(screenWidth, screenHeight) / Math.min(screenWidth, screenHeight);
        // iPad的宽高比通常在1.33左右（4:3比例）
        const iPadAspectRatio = 4 / 3;
        const tolerance = 0.1; // 容差值
        // 检查用户代理字符串（如果在浏览器环境中）
        let isIPadByUserAgent = false;
        if (typeof navigator !== 'undefined' && navigator.userAgent) {
            const userAgent = navigator.userAgent.toLowerCase();
            isIPadByUserAgent = userAgent.includes('ipad') ||
                (userAgent.includes('macintosh') && 'ontouchend' in document);
        }
        // 综合判断：宽高比接近iPad或用户代理包含iPad信息
        const isIPadByAspectRatio = Math.abs(aspectRatio - iPadAspectRatio) < tolerance;
        return isIPadByAspectRatio || isIPadByUserAgent;
    }


    /**
     * 获取屏幕类型
     */
    public getScreenType(): ScreenType {
        return this.screenType;
    }


    /**
     * 显示尾卡
     * @param isSuccess 尾卡是否成功
     */
    showEndCard(isSuccess: boolean = true) {
        this.logoRootNode.active = false;
        this.endCardNode.active = true;
        //A版
        if (this.endcardType == EndCardType.A版) {
            this.successANode.active = isSuccess;
            this.failANode.active = !isSuccess;
        }
        //B版
        if (this.endcardType == EndCardType.B版) {
            this.successBNode.active = isSuccess;
            this.failBNode.active = !isSuccess;
        }
    }


    /**
     * 设置引导显示状态
     */
    setGuideActive(isShow: boolean) {
        this.AnimNode.active = isShow;
        if (this.guideType == GuideType.短按) {
            this.shortTouchGuideNode.active = isShow;
        } else if (this.guideType == GuideType.长按) {
            this.longTouchGuideNode.active = isShow;
        }
    }

    onDownLoad() {
        console.log("跳转到商城");
        // PlayableSDK.download();
    }

    onTryAgain() {
        //这里实现再来一次逻辑
    }
}



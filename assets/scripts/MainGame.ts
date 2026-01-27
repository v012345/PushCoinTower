import { _decorator, Component, Node, tween, Camera, UIOpacity, screen, view, Vec3, ResolutionPolicy, UITransform, Widget, v3, input, Input } from 'cc';
import { GameGlobal } from './GameGlobal';
import { AudioManager } from "./PASDK/AudioManager";
import { UIAdjust, UIAdjustType } from './Utils/UIAdjust';
import { LeadActor } from './LeadActor';
import { Vendor } from './Vendor';
import { EventEnum } from './Event/EventEnum';
import { GameEvent } from './managers/EventManager';
import { Prefab } from 'cc';
import { Player } from './Player';
const { ccclass, property } = _decorator;

declare var window: any;
@ccclass('MainGame') // MainGame.ts 挂到 UILayer 节点上
export class MainGame extends Component {
    @property(Camera)
    mainCamera: Camera;
    @property(Node)
    JoyStickNode: Node;
    onLoad() {
        GameGlobal.MainCamera = this.mainCamera;
        GameGlobal.UILayer = this.node;
    }


    start() {
        AudioManager.musicPlay("MainBGM", true);
        this.schedule(() => { GameEvent.emit(EventEnum.HeartBeat); }, 1.0);
        view.on("canvas-resize", this.resize, this);
        this.scheduleOnce(this.resize, 0.3);

        this.scheduleOnce(() => {
            //@ts-ignore
            if (window.setLoadingProgress) {
                //@ts-ignore
                window.setLoadingProgress(100);
            }
        })

        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

    }


    onTouchStart(event: any) {
        LeadActor.move();
        this.showJoyStick(event);
    }

    showJoyStick(event: any) {
        let touchPos = event.getUILocation();
        let uiTransform = this.node.getComponent(UITransform);
        let joyStickPos = uiTransform.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
        this.JoyStickNode.setPosition(joyStickPos);
        let uiOpacity = this.JoyStickNode.getComponent(UIOpacity);
        uiOpacity.opacity = 255;
        tween(uiOpacity).to(0.2, { opacity: 0 }).start();
    }


    onTouchMove() {
        LeadActor.move();
    }


    onTouchEnd() {
        LeadActor.stop();
    }


    onTouchCancel() {
        LeadActor.stop();
    }





    update(deltaTime: number) {

    }



    // 先不关了, 不是我写的
    resize() {
        if (screen.windowSize.height > screen.windowSize.width) {
            let ratio = screen.windowSize.height / screen.windowSize.width;
            let isRect = ratio >= 1 && ratio <= 1.77;
            view.setResolutionPolicy(ResolutionPolicy.FIXED_WIDTH);

            GameGlobal.viewScale = screen.windowSize.width / view.getDesignResolutionSize().width;
            GameGlobal.realHeight = screen.windowSize.height / GameGlobal.viewScale;
            GameGlobal.realWidth = view.getDesignResolutionSize().width;
            console.log('resize 竖屏', GameGlobal.viewScale, GameGlobal.realWidth, GameGlobal.realHeight, screen.windowSize.width, screen.windowSize.height, ratio);

            this.node.getComponentsInChildren(UIAdjust).forEach(v => {
                if (isRect) {
                    v.type = UIAdjustType.竖屏;
                } else {
                    v.type = UIAdjustType.竖屏;
                }
                v.updateImpl();
            })
            
        } else {
            let ratio = screen.windowSize.width / screen.windowSize.height;
            let isRect = ratio >= 1 && ratio <= 1.77;
            view.setResolutionPolicy(ResolutionPolicy.FIXED_HEIGHT);

            GameGlobal.viewScale = screen.windowSize.height / view.getDesignResolutionSize().height;
            GameGlobal.realHeight = view.getDesignResolutionSize().height;
            GameGlobal.realWidth = screen.windowSize.width / GameGlobal.viewScale;
            console.log('resize 横屏', GameGlobal.viewScale, GameGlobal.realWidth, GameGlobal.realHeight, screen.windowSize.width, screen.windowSize.height, ratio);
            // GameGlobal.isShu = false;

            this.node.getComponentsInChildren(UIAdjust).forEach(v => {
                if (isRect) {
                    v.type = UIAdjustType.横屏;
                } else {
                    v.type = UIAdjustType.横屏;
                }
                // v.updateImpl();
            })
        }
        // GameGlobal.CameraControl.cameraOnLoad();
    }
    private resizeTitle() {
        // let widget = this.titleNode.getComponent(Widget);
        // console.log(this.titleNode.getComponent(Widget).top)
        // if (this._isPortrait) {
        //     widget.top = 0.265;
        // } else {
        //     widget.top = 0.16;
        // }
        // for (let el of this.titleNode.children) {
        //     if (this._isIpad) {
        //         el.scale = v3(0.75, 0.75, 1);
        //     } else {
        //         this.titleNode.scale = v3(1, 1, 1);
        //     }
        // }
    }
    private resizeLogo() {
        // if (this._isIpad) {
        //     this.logo.scale = v3(0.65, 0.65, 1);
        // } else {
        //     this.logo.scale = v3(0.8, 0.8, 1);
        // }
        // if (this._isPortrait) {
        //     this.logo.getComponent(Widget).left = 10;
        // } else {
        //     if (this._isIpad) {
        //         this.logo.getComponent(Widget).left = 45;
        //     } else {
        //         this.logo.getComponent(Widget).left = 60;
        //     }
        // }
    }
}



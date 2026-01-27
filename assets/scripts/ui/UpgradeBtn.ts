import { _decorator, Component, screen, Node, Animation, tween, Tween, v3, UIOpacity, TiledUserNodeData, Vec3, view } from 'cc';
import { AudioManager } from '../PASDK/AudioManager';
import { Player } from '../Player';
import { GameGlobal } from '../GameGlobal';
import { Tractor } from '../prefabs/Tractor';
import { GameEvent } from '../managers/EventManager';
import { Utils } from '../Utils';
import { EventEnum } from '../Event/EventEnum';
import { PlayableSDK } from '../PASDK/PlayableSDK';
const { ccclass, property } = _decorator;

@ccclass('LevelupBtn')
export class LevelupBtn extends Component {
    isShowMax: boolean = false;
    price: number = 0;
    isBreathing: boolean = false;
    isTouching: boolean = false;
    @property(Animation)
    levelup: Animation;
    @property(Node)
    outline: Node;
    originalScale: Vec3;
    start() {
        this.originalScale = this.node.getParent().scale.clone();
        this.setDisplayPrice(GameGlobal.GearsUp[GameGlobal.Tractor.cargoBedLevel + 1]);
        if (screen.windowSize.height > screen.windowSize.width) {
            this.originalScale = new Vec3(1.3, 1.3, 1.3);
        } else {
            this.originalScale = new Vec3(1, 1, 1);
        }
        Tween.stopAllByTarget(this.node.getParent());
        this.node.getParent().setScale(this.originalScale);
        view.on("canvas-resize", () => {
            if (screen.windowSize.height > screen.windowSize.width) {
                this.originalScale = new Vec3(1.3, 1.3, 1.3);
            } else {
                this.originalScale = new Vec3(1, 1, 1);
            }
            Tween.stopAllByTarget(this.node.getParent());
            this.node.getParent().setScale(this.originalScale);
        }, this);
    }
    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        // this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    onTouchStart() {
        Tween.stopAllByTarget(this.node.getParent());
        this.node.getParent().setScale(this.originalScale);
        this.isBreathing = false;
        this.isTouching = true;

    }

    onTouchMove() {
        // console.log("点住并移动");
    }

    onTouchEnd() {
        this.isBreathing = false;
        this.isTouching = false;

    }

    onTouchCancel() {
        this.isBreathing = false;
        this.isTouching = false;

    }

    setDisplayPrice(cost: number) {
        this.price = cost;
        this.node.getChildByName("cost").getComponent('cc.Label').string = cost.toString();
    }

    update(deltaTime: number) {
        if (this.isShowMax) { this.node.getComponent('cc.Sprite').grayscale = false; return; }
        let playerMoney = Player.getMoney();
        if (playerMoney < this.price) {
            this.node.getComponent('cc.Sprite').grayscale = true;
            Tween.stopAllByTarget(this.node.getParent());
            this.node.getParent().setScale(this.originalScale);
            this.isBreathing = false;
        } else {
            this.node.getComponent('cc.Sprite').grayscale = false;
            if (this.isBreathing) return;
            this.isBreathing = true;
            if (this.isTouching) return;
            Utils.breathEffect(this.node.getParent());
        }



    }
    showMaxLevel() {
        this.isShowMax = true;
        Tween.stopAllByTarget(this.node.getParent());
        this.node.getParent().setScale(this.originalScale);
        this.node.getChildByName("max").active = true;
        this.node.getChildByName("coin").active = false;
        this.node.getChildByName("cost").active = false;
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        // this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    cargoBedUpgrade() {
        if (GameGlobal.GameOver) {
            PlayableSDK.download();
            return;
        }
        GameEvent.emit(EventEnum.BtnClicked);
        let nextLv = GameGlobal.Tractor.cargoBedLevel + 1;
        if (GameGlobal.CargoBedUp[nextLv]) {
            if (Player.getMoney() >= GameGlobal.CargoBedUp[nextLv][0]) {
                AudioManager.audioPlay("Click", false);
                Player.addMoney(-GameGlobal.CargoBedUp[nextLv][0]);
                GameGlobal.Tractor.isUpgrading = true
                GameGlobal.Tractor.unloadCoins(GameGlobal.CargoBedUp[nextLv][0], this.node, () => {
                    this.scheduleOnce(() => {
                        GameGlobal.Tractor.isUpgrading = false
                        GameEvent.emit("CargoBedUpgrade");
                        this.levelup.play();
                        if (GameGlobal.CargoBedUp[nextLv + 1]) {
                            this.setDisplayPrice(GameGlobal.CargoBedUp[nextLv + 1][0]);
                        } else { this.showMaxLevel(); }
                    }, 1)
                });

                this.scheduleOnce(() => {
                    this.outline.getComponent(UIOpacity).opacity = 255;
                    tween(this.outline.getComponent(UIOpacity))
                        .to(1, { opacity: .0 })
                        .start()
                }, 1);

                return
            }
        } else {
            this.showMaxLevel();
        }
        AudioManager.audioPlay("Reject", false);
    }

}



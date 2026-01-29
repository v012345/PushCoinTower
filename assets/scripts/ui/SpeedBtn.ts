import { _decorator, view, screen, Component, Node, Animation, tween, Tween, v3, UIOpacity, Vec3 } from 'cc';
import { AudioManager } from '../PASDK/AudioManager';
import { Player } from '../Player';
import { GameGlobal } from '../GameGlobal';
import { Tractor } from '../prefabs/Tractor';
import { GameEvent } from '../managers/EventManager';
import { Utils } from '../Utils';
import { EventEnum } from '../Event/EventEnum';
import { PlayableSDK } from '../PASDK/PlayableSDK';
const { ccclass, property } = _decorator;

@ccclass('SpeedBtn')
export class SpeedBtn extends Component {
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
        this.setDisplayPrice(GameGlobal.GearsUp[GameGlobal.Tractor.speedLevel + 1]);
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

    isReceivingCoins: boolean = false;
    update(deltaTime: number) {
        if (this.isShowMax) {
            this.setGray(true);
            return;
        }
        let playerMoney = Player.getMoney();
        if (playerMoney < this.price) {
            this.setGray(true);
            Tween.stopAllByTarget(this.node.getParent());
            this.node.getParent().setScale(this.originalScale);
            this.isBreathing = false;
        } else {
            this.setGray(false);
            if (this.isTouching) return;
            if (this.isReceivingCoins) return;
            if (this.isBreathing) return;
            Utils.breathEffect(this.node.getParent());
            this.isBreathing = true;
        }
    }

    setGray(isGray: boolean) {
        this.node.getComponent('cc.Sprite').grayscale = isGray;
        this.node.children.forEach(child => {
            if (child.name != "levelup") {
                let sprite = child.getComponent('cc.Sprite');
                if (sprite) sprite.grayscale = isGray;
            }
        });
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


    speedUpgrade() {
        if (GameGlobal.GameOver) {
            PlayableSDK.download();
            return;
        }
        GameEvent.emit(EventEnum.BtnClicked);
        let nextLv = GameGlobal.Tractor.speedLevel + 1;
        if (GameGlobal.SpeedUp[nextLv]) {
            if (Player.getMoney() >= GameGlobal.SpeedUp[nextLv][0]) {
                GameGlobal.Tractor.isUpgrading = true;
                AudioManager.audioPlay("Click", false);
                Player.addMoney(-GameGlobal.SpeedUp[nextLv][0]);
                GameGlobal.Tractor.unloadCoins(GameGlobal.SpeedUp[nextLv][0], this.node, () => {
                    this.scheduleOnce(() => {
                        GameGlobal.Tractor.isUpgrading = false;
                        GameEvent.emit("SpeedUpgrade");
                        this.levelup.play();
                        if (GameGlobal.SpeedUp[nextLv + 1]) {
                            this.setDisplayPrice(GameGlobal.SpeedUp[nextLv + 1][0]);
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





import { CCBoolean, CCFloat, Component, Quat, Vec3, _decorator, ccenum } from "cc";
import { PathLine } from "./PathLine";
const { ccclass, property } = _decorator;

export enum MoveType {
	once = 1,
	loop = 2,
	yoyo = 3
}
ccenum(MoveType);

@ccclass('MoveAlongPath')
export class MoveAlongPath extends Component {

	public static ArrivedEvent = 'ArrivedEvent';

	@property(PathLine)
	private _pathLine: PathLine;
	@property(PathLine)
	public get pathLine(): PathLine | null {
		return this._pathLine;
	}
	public set pathLine(v) {
		this._pathLine = v;
		this.init();
	}

	@property(CCFloat)
	private speed: number = 1;

	@property({ type: MoveType })
	private moveType: MoveType = MoveType.once;

	@property({ displayName: '使用路径坐标' })
	private usePathPos: boolean = false;
	@property({ displayName: '使用完整的路径点' })
	private useWholePath: boolean = false;

	@property({ type: Vec3, displayName: "前方坐标轴" })
	private forwardAxis: Vec3 = Vec3.FORWARD.clone();
	@property({ type: Vec3, displayName: "可旋转轴" })
	private rotateAxis: Vec3 = Vec3.UNIT_Y.clone();

	@property(CCBoolean)
	private moveOnLoad: boolean = false;

	private posArr: Vec3[];

	private allDistance = 0;
	private moveDistance = 0;
	private moveTime = 0;

	public moving = false;

	private startIndex = 0;
	private index = 0;

	private initOffset = new Vec3();
	private projPos = new Vec3();

	private currPos = new Vec3();
	private currDir = new Vec3();
	private targetQuat = new Quat();

	private moveDistanceOffset = 0;

	private curDistance = 0;

	protected start(): void {
		console.log('MoveAlongPath start');
		this.init();
	}

	private projectPointInLine(p: Vec3, start: Vec3, end: Vec3) {
		let guideLine = Vec3.subtract(new Vec3(), p, start);
		let vector = Vec3.subtract(new Vec3(), end, start).normalize();
		let n = Vec3.dot(vector, guideLine);
		return Vec3.scaleAndAdd(new Vec3(), start, vector, n);
	}

	public init() {
		if (!this.pathLine || !this._pathLine.pathPoints) return;

		this.posArr = Array.from(this._pathLine.pathPoints);

		let startId = this.findNearstIndex();
		if (startId < this.posArr.length - 1) {
			// 投影点
			this.projPos = this.projectPointInLine(this.node.position, this.posArr[startId], this.posArr[startId + 1]);
		}

		if (this.useWholePath) {
			if (this.usePathPos) {
				this.node.setPosition(this.posArr[0]);
			} else {
				Vec3.subtract(this.initOffset, this.node.position, this.projPos);
				this.node.setPosition(Vec3.add(new Vec3(), this.posArr[0], this.initOffset));
			}
		} else {
			if (this.usePathPos) {
				this.node.setPosition(this.projPos);
			} else {
				Vec3.subtract(this.initOffset, this.node.worldPosition, this.projPos);
			}
			this.moveDistanceOffset = Vec3.distance(this.posArr[startId], this.projPos);
			this.startIndex = startId;
		}
		Vec3.subtract(this.rotateAxis, Vec3.ONE, this.rotateAxis);

		this.updateData();
		// console.log('----', this.startIndex, this.moveDistanceOffset, this.allDistance, this.projPos)

		if (this.moveOnLoad) {
			this.startMove();
		}
	}

	public startMove() {
		this.moveDistance = 0;
		this.index = this.startIndex;
		// this.moveTime = 0;

		if (this.posArr && this.posArr.length > 1) {
			this.moving = true;
		}
	}

	public stop() {
		this.moving = false;
	}

	private findNearstIndex() {
		let pos = this.node.getPosition();
		let dis = 0;
		let min = Number.MAX_VALUE;
		let index = 0;
		for (let i = 0; i < this.posArr.length; i++) {
			dis = Vec3.squaredDistance(this.posArr[i], pos);
			if (dis < min) {
				min = dis;
				index = i;
			}
		}

		if (index == 0) return index;

		// 检测是否向前
		let preId = index - 1;
		let walkPos = new Vec3();
		Vec3.subtract(walkPos, this.posArr[preId], this.posArr[index]).normalize();	// 方向
		Vec3.scaleAndAdd(walkPos, pos, walkPos, 0.1);
		if (Vec3.distance(pos, this.posArr[index]) < Vec3.distance(walkPos, this.posArr[index])) {
			// 反向
			index = preId;
		}

		return index;
	}

	private updateData() {
		if (this.posArr.length > 1) {
			for (let i = this.startIndex + 1; i < this.posArr.length; i++) {
				this.allDistance += Vec3.distance(this.posArr[i], this.posArr[i - 1]);
			}
			this.allDistance -= this.moveDistanceOffset;

			if (this.allDistance / (this.speed / 60) <= this.posArr.length) {
				console.log('每帧速度大于设置的路径分段距离。');
			}
		}
	}


	protected update(dt: number): void {
		if (this.moving) {
			//this.moveTime += dt;
			// let s = this.moveTime * this.speed;

			this.curDistance += dt * this.speed;

			if (this.moveDistance < this.allDistance && this.curDistance < this.allDistance) {
				let pos;
				for (let i = this.index; i < this.posArr.length - 1; i++) {
					pos = (!this.useWholePath && i === this.startIndex) ? this.projPos : this.posArr[i];
					let ns = Vec3.distance(this.posArr[i + 1], pos);
					this.moveDistance += ns;

					if (this.moveDistance > this.curDistance) {
						this.index = i;
						this.moveDistance -= ns;
						// console.log(i, this.moveDistance, ns, s, this.allDistance, this.moveTime)
						Vec3.subtract(this.currDir, this.posArr[i + 1], pos).normalize();
						Vec3.scaleAndAdd(this.currPos, pos, this.currDir, (this.curDistance - this.moveDistance));
						this.usePathPos || Vec3.add(this.currPos, this.currPos, this.initOffset);
						break;
					}
				}

				// console.log('-----update', this.currPos, this.index, s, this.moveDistance, this.allDistance)
				this.node.setPosition(this.currPos);


				Vec3.multiply(this.currDir, this.currDir, this.rotateAxis);
				Quat.rotationTo(this.targetQuat, this.forwardAxis, this.currDir);
				this.node.setRotation(this.targetQuat);
			} else {
				// end
				this.node.emit(MoveAlongPath.ArrivedEvent);

				if (this.moveType === MoveType.once) {
					this.moving = false;
					// console.log('---------end')
				} else if (this.moveType === MoveType.loop) {
					if (this.useWholePath) {
						if (this.usePathPos) {
							this.node.setWorldPosition(this.posArr[0]);
						} else {
							Vec3.add(this.currPos, this.projPos, this.initOffset);
							this.node.setWorldPosition(this.currPos);
						}
					} else {
						if (this.usePathPos) {
							this.node.setWorldPosition(this.projPos);
						} else {
							Vec3.add(this.currPos, this.projPos, this.initOffset);
							this.node.setWorldPosition(this.currPos);
						}
					}

					this.startMove();
				} else if (this.moveType === MoveType.yoyo) {
					this.posArr = this.posArr.reverse();
					this.startMove();
				}
			}
		}
	}

	getSpeed() {
		return this.speed;
	}

	setSpeed(speed) {
		this.scheduleOnce(() => {
			this.speed = speed;
		})
	}

}
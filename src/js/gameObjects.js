// Wall class
class WallInterface extends P2Interface {
    constructor (wallType, x, y, w, h) {
        if (wallType === WALL_TYPE.NOJAB || wallType === WALL_TYPE.HNOJAB) {
            super(P2I_TYPE.WALL, x, y, w, h, {
                collisionGroup: GROUP.NOJAB,
                collisionMask: MASK.UNIVERSAL,
                material: MATERIAL.WALL
            }, {});
        } else if (wallType === WALL_TYPE.BOUNCE) {
            super(P2I_TYPE.WALL, x, y, w, h, {
                collisionGroup: GROUP.WALL,
                collisionMask: MASK.UNIVERSAL,
                material: MATERIAL.BOUNCE
            }, {});
            this.color = "#0F0";
        } else if (wallType === WALL_TYPE.BNOJAB) {
            super(P2I_TYPE.WALL, x, y, w, h, {
                collisionGroup: GROUP.NOJAB,
                collisionMask: MASK.UNIVERSAL,
                material: MATERIAL.BOUNCE
            }, {});
            this.color = "#0F0";
        } else {
            super(P2I_TYPE.WALL, x, y, w, h, {
                collisionGroup: GROUP.WALL,
                collisionMask: MASK.UNIVERSAL,
                material: MATERIAL.WALL
            }, {});
        }
        this.wallType = wallType;

        wallArray.push(this);
    }
}

class PlatformInterface extends P2Interface {
    constructor (wallType, motionType, x, y, w, h, t) {
        // TODO: Finish PlatformInterface
    }
}

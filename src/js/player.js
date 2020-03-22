class PlayerInterface extends P2Interface {
    constructor (x, y, w, h, mass) {
        super(P2I_TYPE.PLAYER, x, y, w, h, {
            collisionGroup: GROUP.PLAYER,
            collisionMask: MASK.UNIVERSAL,
            material: MATERIAL.PLAYER
        }, {
            mass: mass,
            damping: 0
        });
        this.color = "#F00";
        
        this.touching = {
            ground: false, leftWall: false, rightWall: false
        };
        this.playerState = {
            wallJumpTime: 0, wallJumpDir: 0,
            isJabbing: false, isJabDone: false, isJabLocked: false,
            jabDist: 0, jabTime: 0, jabDir: [0, 0], jabY: 0,
            jabLockPoint: [0, 0]
        };

        this.abilities = {
            hasJump: true,
            hasJab: true,
            hasWalljump: true
        };
        
        // TODO: transfer jab variables out of playerState
        this.jab = {
            ongoing: false,
            isExtended: false,
            hasClank: false,  hasHit: false,
            hitPoint: [0, 0],
            dist: 0, time: 0,
            dir: [0, 0],
            ray: new p2.Ray({
                mode: p2.Ray.CLOSEST,
                from: [0, 0], to: [0, 0]
            })
        };
        
        return this;
    }
    
    draw () {
        let pos = world.bodies[this.id].position;
        DrawCamera.setColor("#000");
        if (this.jab.ongoing) {
            let x = pos[0] + this.jab.dir[0] * this.jab.dist,
                y = pos[1] + this.jab.dir[1] * this.jab.dist;
            DrawCamera.drawLine(pos[0], pos[1], x, y);
        }
        DrawCamera.setColor(this.color);
        DrawCamera.drawBox(pos[0], pos[1], this.w, this.h)
    }
    
    update(dt) {
        const WALK_ACCEL = 96,
            HORIZ_MAX = 12,
            HORIZ_DECAY = 6 * WALK_ACCEL * dt / (6 * HORIZ_MAX + 6 * WALK_ACCEL * dt),
            GRAVITY = 2.828;
  
        let body = world.bodies[this.id];
        this.updateTouching(body);
        
        // Horizontal Movement
        if (this.playerState.wallJumpTime > 0) {
            if (this.playerState.wallJumpTime < dt) {
                this.playerState.wallJumpTime = 0;
            } else {
                this.playerState.wallJumpTime -= dt * TIME_SCALE;
            }
            if (this.playerState.wallJumpDir < 0 && Keys.isPressed("a")) {
                body.velocity[0] -= WALK_ACCEL * dt;
            } else if (this.playerState.wallJumpDir > 0 && Keys.isPressed("d")) {
                body.velocity[0] += WALK_ACCEL * dt;
            }
        } else {
            if (Keys.isPressed("a") && !this.touching.leftWall) {
                body.velocity[0] -= WALK_ACCEL * dt * Keys.isPressed("a");
            }
            if (Keys.isPressed("d") && !this.touching.rightWall) {
                body.velocity[0] += WALK_ACCEL * dt * Keys.isPressed("d");
            }
        }
        if (this.touching.ground) {
            body.velocity[0] -= HORIZ_DECAY * body.velocity[0];
        } else {
            //body.velocity[0] -= Math.sign(body.velocity[0]) * 
            //    HORIZ_DECAY * HORIZ_DECAY * body.velocity[0] * body.velocity[0] / (WALK_ACCEL * dt);
        }
        if (body.velocity[0] > HORIZ_MAX) {
            body.velocity[0] = HORIZ_MAX;
        } else if (body.velocity[0] < -HORIZ_MAX) {
            body.velocity[0] = -HORIZ_MAX;
        }
        
        // Jab
        if (this.abilities.hasJab) {
            this.jabLogic(body, dt);
        }
        
        // Jumping
        if (this.abilities.hasJump) {
            this.jumpLogic(body);
        }
        
        if (this.jab.hasHit) {
            body.gravityScale = 0;
        } else if (Keys.isPressed(" ")) {
            body.gravityScale = 1;
        } else {
            body.gravityScale = GRAVITY;
        }
    }
    
    jabLogic (body, dt) {
        const JAB_REACH = 2.25,
            JAB_DELTA = 12,
            JAB_TIME = 250;
        
        let jabPos;
        if (this.jab.ongoing) {
            if (this.jab.hasHit) {
                if (this.jab.dist < JAB_REACH) {
                    this.jab.dist += JAB_DELTA * dt;
                    if (this.jab.dist > JAB_REACH) {
                        this.jab.dist = JAB_REACH;
                        this.jab.isExtended = true;
                    }
                }
                body.position[0] = this.jab.hitPoint[0] -
                    this.jab.dir[0] * this.jab.dist;
                body.position[1] = this.jab.hitPoint[1] -
                    this.jab.dir[1] * this.jab.dist;
                body.velocity[0] = 0;
                body.velocity[1] = 0;
                //console.log(body.position.x, body.position.y);
            } else if (!this.jab.hasClank && (jabPos = this.doesJabHit(body))) {
                // If it collides with something, lock on to the position
                this.jab.hasHit = true;
                this.jab.hitPoint = jabPos;
                this.jab.dist = p2.vec2.dist(jabPos, body.position);
            } else if (this.jab.isExtended || this.jab.hasClank) { // When it is full extended
                // Stay fully extended for JAB_TIME milliseconds
                if (this.jab.time > 0) {
                    if (this.jab.time <= dt) {
                        this.jab.time = 0;
                        console.log("!");
                    } else {
                        this.jab.time -= dt * TIME_SCALE;
                    }
                } else {
                    // Retract
                    if (this.jab.dist > 0) {
                        this.jab.dist -= JAB_DELTA * dt;
                        if (this.jab.dist <= 0) {
                            this.jab.dist = 0;
                            this.jab.ongoing = false;
                        }
                    }
                }
            } else {
                // If it is not fully extended, keep extending it
                if (this.jab.dist < JAB_REACH) {
                    this.jab.dist += JAB_DELTA * dt;
                    if (this.jab.dist >= JAB_REACH) {
                        this.jab.dist = JAB_REACH;
                        this.jab.isExtended = true;
                    }
                }
            }
        } else { // If we are not currently jabbing
            if (Keys.isBuffered("j") && Keys.getBufferTimer("j") <= 6 * DT) {
                this.jab.ongoing = true;
                this.jab.isExtended = false;
                this.jab.hasHit = false;
                this.jab.dist = 0;
                this.jab.time = JAB_TIME;
                
                this.jab.dir = this.getDirection();
            }
        }
    }
    
    jumpLogic(body) {
        if (Keys.isBuffered(" ")) {
            if (Keys.getBufferTimer(" ") <= 6 * DT) {
                if (this.jab.hasHit) {
                    this.jabJump(body, this.getDirection());
                    Keys.useBuffer(" ");
                } else if (this.touching.ground) {
                    this.jump(body);
                    Keys.useBuffer(" ");
                } else if (this.abilities.hasWalljump) {
                    if (this.touching.leftWall) {
                        if (this.touching.rightWall) {
                            this.jump(body, 0);
                        } else {
                            this.jump(body, -1);
                        }
                        Keys.useBuffer(" ");
                    } else if (this.touching.rightWall) {
                        this.jump(body, 1);
                        Keys.useBuffer(" ");
                    }
                }
            }
        }
    }
    
    doesJabHit (body) {
        // TODO: Make jabRay an inherent object
        this.jab.ray.from = body.position;
        this.jab.ray.to[0] = body.position[0] + this.jab.dir[0] * this.jab.dist;
        this.jab.ray.to[1] = body.position[1] + this.jab.dir[1] * this.jab.dist;
        this.jab.ray.collisionMask = MASK.RAY_CLANK;
        let result = new p2.RaycastResult(), point = [];
        world.raycast(result, this.jab.ray);
        result.getHitPoint(point, this.jab.ray);
        if (result.hasHit()) { 
            // TODO: Clank noise
            this.jab.hasClank = true;
            this.jab.time = 0;
            return null;
        }

        this.jab.ray.collisionMask = MASK.RAY;
        world.raycast(result, this.jab.ray);
        result.getHitPoint(point, this.jab.ray);
        if (result.hasHit()) {
            return point;
        } else {
            return null;
        }
        
    }
    
    jabJump(body, dir) {
        const JJUMP_UP_Y   = 12,
            JJUMP_SIDE_Y   =  1, JJUMP_SIDE_X   = 9,
            JJUMP_UPSIDE_Y = 11, JJUMP_UPSIDE_X = 3,
            JJUMP_DSIDE_Y  =  3, JJUMP_DSIDE_X  = 8,
            JJUMP_DOWN_Y   =  6;
        const JJUMP_TIMEOUT_HORZ = 375,
            JJUMP_TIMEOUT_VERT = 125;
        let mirror = dir[0] > 0 ? 1 : -1;
        this.playerState.wallJumpDir = mirror;
        this.playerState.wallJumpTime = JJUMP_TIMEOUT_HORZ;
        if (dir[1] < 0) {
            if (dir[0] === 0) {
                body.velocity[0] = 0;
                body.velocity[1] = -JJUMP_UP_Y;
                this.playerState.wallJumpDir = 0;
                this.playerState.wallJumpTime = JJUMP_TIMEOUT_VERT;
            } else {
                body.velocity[0] = mirror * JJUMP_UPSIDE_X;
                body.velocity[1] = -JJUMP_UPSIDE_Y;
            }
        } else if (dir[1] > 0) {
            if (dir[0] === 0) {
                body.velocity[0] = 0;
                body.velocity[1] = JJUMP_DOWN_Y;
                this.playerState.wallJumpDir = 0;
                this.playerState.wallJumpTime = JJUMP_TIMEOUT_VERT;
            } else {
                body.velocity[0] = mirror * JJUMP_DSIDE_X;
                body.velocity[1] = JJUMP_DSIDE_Y;
            }
        } else if (dir[0] === 0) {
            // Neutral jump
            body.velocity[0] = 0;
            body.velocity[1] = -JJUMP_UP_Y / 2;
            this.playerState.wallJumpDir = 0;
            this.playerState.wallJumpTime = JJUMP_TIMEOUT_VERT;
        } else {
            body.velocity[0] = mirror * JJUMP_SIDE_X;
            body.velocity[1] = -JJUMP_SIDE_Y;
        }
        this.jab.ongoing = false;
        this.jab.hasHit = false;
    }
    
    jump (body, walljump = null) {
        const JUMP_FORCE = 12,
            WALLJUMP_FORCE_Y = 6,
            WALLJUMP_FORCE_X = 8,
            WALLJUMP_TIMEOUT = 375;
        if (walljump !== null) {
            body.velocity[0] = walljump * WALLJUMP_FORCE_X;
            body.velocity[1] = body.velocity[1] > 0 ? 0 : body.velocity[1];
            body.velocity[1] -= WALLJUMP_FORCE_Y;
            this.playerState.wallJumpTime = WALLJUMP_TIMEOUT;
            this.playerState.wallJumpDir = walljump;
        } else {
            body.velocity[1] = -JUMP_FORCE;
        }
    }
    
    getDirection() {
        let dir = [0, 0];
        const SRH = 0.70710678118; // Square root of one half
        if (Keys.isPressed("d") && !Keys.isPressed("a")) {
            if (Keys.isPressed("w") && !Keys.isPressed("s")) {
                dir = [SRH, -SRH];
            } else if (Keys.isPressed("s") && !Keys.isPressed("w")) {
                dir = [SRH, SRH];
            } else {
                dir = [1, 0];
            }
        } else if (Keys.isPressed("a") && !Keys.isPressed("d")) {
            if (Keys.isPressed("w") && !Keys.isPressed("s")) {
                dir = [-SRH, -SRH];
            } else if (Keys.isPressed("s") && !Keys.isPressed("w")) {
                dir = [-SRH, SRH];
            } else {
                dir = [-1, 0];
            }
        } else if (Keys.isPressed("w") && !Keys.isPressed("s")) {
            dir = [0, -1];
        } else if (Keys.isPressed("s") && !Keys.isPressed("w")) {
            dir = [0, 1];
        }
        return dir;
    }
    
    updateTouching (body) {
        let i = world.narrowphase.contactEquations.length - 1;
        this.touching.ground    = false;
        this.touching.leftWall  = false;
        this.touching.rightWall  = false;
        for(; i >= 0; i -= 1){
            let c = world.narrowphase.contactEquations[i];
            if(c.bodyA === body){
                if(c.normalA[1] > 0.5) {
                    this.touching.ground = true;
                } else if (c.normalA[0] > 0.5) {
                    this.touching.leftWall = true;
                } else if (c.normalA[0] < -0.5) {
                    this.touching.rightWall = true;
                }
            } else if (c.bodyB === body) {
                if(c.normalA[1] < -0.5) {
                    this.touching.ground = true;
                } else if (c.normalA[0] < -0.5) {
                    this.touching.leftWall = true;
                } else if (c.normalA[0] > 0.5) {
                    this.touching.rightWall = true;
                }
            }
        }
    }
}

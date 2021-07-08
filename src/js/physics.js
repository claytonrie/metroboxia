var world = new p2.World({ gravity : [0, 18.0] });
world.solver.tolerance = 0.00001;
defineMaterials(world); // Define our world

class P2Interface {
    constructor (type, x, y, w, h, shapeProp, bodyProp) {
        this.type = type;
        this.subType = 0;
        this.motionType = -1; // Specifically for platforms
        this.id = -1;
        this.w = w; this.h = h;
        this.color = "#000";
        
        let box;
        bodyProp.position = [x, y];
        bodyProp.fixedRotation = true;
        box = new p2.Body(bodyProp);
        
        shapeProp.width = w; shapeProp.height = h;
        box.addShape(new p2.Box(shapeProp));
        
        this.id = world.bodies.length;
        world.addBody(box);
        
        return this;
    }
    
    getBody() { return world.bodies[this.id]; }
    draw () {
        let pos = world.bodies[this.id].position;
        DrawCamera.setColor(this.color);
        DrawCamera.drawBox(pos[0], pos[1], this.w, this.h);
    }
    
    static drawAll(array) {
        let i = array.length - 1;
        for (; i >= 0; i -= 1) {
            array[i].draw();
        }
    }
}

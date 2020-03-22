// Creation of our canvas
var cv = document.createElement("canvas");
cv.width = 512; cv.height = 512;
document.body.appendChild(cv);

// Game camera
var DrawCamera = new (class {
    constructor (canvas) {
        // target position
        this.tarX = 0;
        this.tarY = 0;
        // Actual camera position
        this.x = 0; this.y = 0;
        
        // The canvas;
        this.cv = canvas;
        this.ctx = canvas.getContext("2d");
        this.vWidth = canvas.width / VSCALE;
        this.vHeight = canvas.height / VSCALE;
        this.ctx.fillStyle = this.clr = "#000";
    }
    
    setColor (clr) {
        if (this.clr !== clr) {
            this.ctx.strokeStyle = 
                this.ctx.fillStyle = 
                this.clr = clr;
        }
    }
    
    drawLine (x1, y1, x2, y2) {
        if ((x1 > this.x || x2 > this.x) && (y1 > this.y || y2 > this.y)) {
            if ((x1 - this.x < this.vWidth) || (x2 - this.x < this.vWidth)) {
                if ((y1 - this.y < this.vHeight) || (y2 - this.y < this.vHeight)) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(Math.round(VSCALE * (x1 - this.x)), 
                        Math.round(VSCALE * (y1 - this.y)));
                    this.ctx.lineTo(Math.round(VSCALE * (x2 - this.x)), 
                        Math.round(VSCALE * (y2 - this.y)));
                    this.ctx.stroke();
                }
            }
        }
    }
    
    drawBox (x, y, w, h) {
        if ((x - this.x > -w / 2) && (y - this.y > -h / 2)) {
            if ((x - this.x < this.vWidth + w / 2) && (y - this.y < this.vHeight + h / 2)) {
                this.ctx.fillRect(Math.round(VSCALE * (x - w / 2 - this.x)), 
                    Math.round(VSCALE * (y - h / 2 - this.y)),
                    Math.round(VSCALE * w), Math.round(VSCALE * h));
            }
        }
    }

    clearScreen () {
        this.ctx.clearRect(0, 0, VSCALE * this.vWidth, VSCALE * this.vHeight)
    }
    
    update(dt) {
        const CAM_DELTA = 8 / VSCALE;
        if (this.x !== this.tarX) {
            if (Math.abs(this.x - this.tarX) <= CAM_DELTA) {
                this.x = this.tarX;
            } else {
                this.x += CAM_DELTA * Math.sign(this.tarX - this.x);
            }
        }
        if (this.y !== this.tarY) {
            if (Math.abs(this.y - this.tarY) <= CAM_DELTA) {
                this.y = this.tarY;
            } else {
                this.y += CAM_DELTA * Math.sign(this.tarY - this.y);
            }
        }
    }
})(cv);

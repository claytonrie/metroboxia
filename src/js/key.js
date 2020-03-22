// Key input set up
var Keys = new (class {
    constructor () {
        this.pressed = [];
        this.buffered = [];
        this.heldTimer = [];
        this.bufferTimer = [];
        this.dirPress = null;
    }

    isPressed (...keys) {
        let i = keys.length - 1;
        for (; i >= 0; i -= 1) {
            if (this.pressed.includes(keys[i])) {
                return true;
            }
        }
        return false;
    }
    isBuffered (...keys) {
        let i = keys.length - 1;
        for (; i >= 0; i -= 1) {
            if (this.buffered.includes(keys[i])) {
                return true;
            }
        }
        return false;
    }

    getHeldTimer(key) {
        return this.heldTimer[this.buffered.indexOf(key)];
    }
    getBufferTimer(key) {
        return this.bufferTimer[this.buffered.indexOf(key)];
    }

    useBuffer (...keys) {
        let i = keys.length - 1;
        for (; i >= 0; i -= 1) {
            if (this.buffered.includes(keys[i])) {
                this.bufferTimer.splice(this.buffered.indexOf(keys[i]), 1);
                this.buffered.splice(this.buffered.indexOf(keys[i]), 1);
            }
        }
    }
    clearBuffer () {
        this.buffered = [];
        this.bufferTimer = [];
    }

    updateTimer (dt) {
        let i = this.bufferTimer.length - 1;
        for (; i >= 0; i -= 1) { this.bufferTimer[i] += dt; }
        i = this.heldTimer.length - 1;
        for (; i >= 0; i -= 1) { this.heldTimer[i] += dt; }
    }
})();

onkeydown = e => {
    let k = e.key.toLowerCase();
    if (!Keys.pressed.includes(k)) {
        Keys.pressed.push(k); Keys.heldTimer.push(0);
        if (!Keys.buffered.includes(k)) {
            Keys.buffered.push(k); Keys.bufferTimer.push(0);
        } else {
            Keys.bufferTimer[Keys.buffered.indexOf(k)] = 0;
        }
    }
};
onkeyup = e => {
    let k = e.key.toLowerCase();
    if (Keys.pressed.includes(k)) {
        Keys.heldTimer.splice(Keys.pressed.indexOf(k), 1);
        Keys.pressed.splice(Keys.pressed.indexOf(k), 1);
    }
};

const CHUNK_SIZE = 16;
var ChunkHandler = new (class {
    constructor (canvas) {
        let chunksMax = Math.ceil(canvas.width / VSCALE / CHUNK_SIZE) + 1;
        chunksMax *=  Math.ceil(canvas.height / VSCALE / CHUNK_SIZE) + 1;
        this.MAX_CHUNKS = chunksMax;
        this.chunkCount = 0;
        
        this.chunkX = new Int16Array(chunksMax);
        this.chunkY = new Int16Array(chunksMax);
    }
    
    reloadChunks() {
        let i = this.chunkCount - 1;
        for (; i >= 0; i -= 1) {
            this.unloadChunk(i);
        }
        this.chunkCount = 0; // "delete" the chunks
        
        const MAX_X = (DrawCamera.x + DrawCamera.vWidth) / CHUNK_SIZE,
            MAX_Y = (DrawCamera.y + DrawCamera.vHeight) / CHUNK_SIZE;
        let x = Math.floor(DrawCamera.x / CHUNK_SIZE), y;
        for (; x <= MAX_X; x += 1) {
            y = Math.floor(DrawCamera.y / CHUNK_SIZE);
            for (; y <= MAX_Y; y += 1) {
                this.loadChunk(x, y);
            }
        }
    }
    
    isLoaded(x, y) {
        let i = this.chunkCount - 1;
        for (; i >= 0; i -= 1) {
            if (this.chunkX[i] === x && this.chunkY[i] === y) {
                return true;
            }
        }
        return false;
    }
    getChunkId(x, y) {
        let i = this.chunkCount - 1;
        for (; i >= 0; i -= 1) {
            if (this.chunkX[i] === x && this.chunkY[i] === y) {
                return i;
            }
        }
        return -1;
    }
    
    loadChunk(x, y) {
        if (this.chunkCount >= this.MAX_CHUNKS) {
            throw new Error("Loaded too many chunks");
        }
        let index = this.chunkCount;
        // Here we interface with our LevelLoader
        this.chunkCount += 1;
    }
    
    unloadChunk(id) {
        // TODO: Store dynamic objects
        // TODO: Delete Static objects
        this.chunkCount -= 1;
        if (this.chunkCount !== id) {
            this.chunkX[id] = this.chunkX[this.chunkCount];
            this.chunkY[id] = this.chunkY[this.chunkCount];
        }
    }
    
    update (dt) {
        // TODO: Look for newly loaded chunks
        // TODO: Load those chunks
    }
})(cv);

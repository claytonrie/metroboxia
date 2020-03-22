const DT = 15; // The milliseconds per frame
const TIME_SCALE = 720; // A divider for our physics engine
const VSCALE = 32; // The up-scaling of our image

// Types of physics objects
const P2I_TYPE = {
    PLAYER:    0,
    WALL:      1,
    KINEMATIC: 2,
    DYNAMIC:   3
};
// Subtypes of walls
const WALL_TYPE = {
    STD: 0,    // Regular wall
    NOJAB: 1,  // A wall you cannot jab
    BOUNCE: 2, // A bouncy wall
    BNOJAB: 3, // A bouncy wall you cannot jab
    HURT:   4, // A wall that damages the player
    HNOJAB: 5  // A damaging wall that you cannot jab
};
// Motion types for platforms
const PLATFORM_TYPE = {
    ELLIPSE: 0
    // TODO: add more?
};

// Storage for our game objects
var player        = null;
var wallArray     = [];
var platformArray = [];
var itemArray     = [];

// Collision groups and masks
const GROUP = {
    PLAYER:   0b1000,
    WALL:     0b0001,
    NOJAB:    0b0010,
    PLATFORM: 0b0001,
    ITEM:     0b0100
};
const MASK = {
    UNIVERSAL: ~0,
    RAY:       ~0b1110,
    RAY_CLANK:  0b0010
};

// Physics Materials
const MATERIAL = {
    PLAYER:   new p2.Material(), // Player-type
    WALL:     new p2.Material(), // Wall-type
    BOUNCE:   new p2.Material(), // Wall-type
    PLATFORM: new p2.Material(), // Kinematic-type
    ITEM:     new p2.Material()  // Dynamic-type
};

// Defining our material interactions
// We have to wait until our world is created to finish this
function defineMaterials(w) {
    // Player--Material contacts
    w.addContactMaterial(new p2.ContactMaterial(
           MATERIAL.PLAYER, MATERIAL.WALL,
        { friction: 1, restitution: 0 }
    ));
    w.addContactMaterial(new p2.ContactMaterial(
           MATERIAL.PLAYER, MATERIAL.PLATFORM,
        { friction: 2, restitution: 0 }
    ));
    w.addContactMaterial(new p2.ContactMaterial(
           MATERIAL.PLAYER, MATERIAL.ITEM,
        { friction: 1, restitution: 0 }
    ));
    w.addContactMaterial(new p2.ContactMaterial(
           MATERIAL.PLAYER, MATERIAL.BOUNCE,
        { friction: 1, restitution: 1 }
    ));
    
    // Item--Material contacts
    w.addContactMaterial(new p2.ContactMaterial(
           MATERIAL.ITEM, MATERIAL.WALL,
        { friction: 0.5, restitution: 0.05 }
    ));
    w.addContactMaterial(new p2.ContactMaterial(
           MATERIAL.ITEM, MATERIAL.PLATFORM,
        { friction: 1, restitution: 0.05 }
    ));
    w.addContactMaterial(new p2.ContactMaterial(
           MATERIAL.ITEM, MATERIAL.BOUNCE,
        { friction: 0.5, restitution: 1 }
    ));
}

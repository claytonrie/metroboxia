player = new PlayerInterface(10,  2, 1, 1, 10);
//new WallInterface(256, 512 - 32,   W - 32, 64, null);
//new WallInterface(300,  150,   64, 64, null);
new WallInterface(WALL_TYPE.STD, 8, 14, 4, 2, null);

setInterval(function () {
    Keys.updateTimer(DT);
    const PHYS_STEPS = 16;
    let i = PHYS_STEPS;
    for (; i > 0; i -= 1) {
        player.update(DT / TIME_SCALE / PHYS_STEPS);
        world.step(DT / TIME_SCALE / PHYS_STEPS);
    }
    //console.log(world.bodies[player.id].velocity[0]);
    
    //console.log(rectArray[0].getBody().position)
    
    DrawCamera.clearScreen();
    //DrawCamera.drawBox(1, 1, 1, 1);
    P2Interface.drawAll(wallArray);
    P2Interface.drawAll(platformArray);
    P2Interface.drawAll(itemArray);
    player.draw();
}, DT);

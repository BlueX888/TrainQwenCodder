const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let player;
let enemy;
let cursors;
let survivalTime = 0;
let collisionCount = 0;
let statusText;
let gameStartTime;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  playerGraphics.fillStyle(0x4a90e2, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（橙色圆形）
  const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  enemyGraphics.fillStyle(0xff8c00, 1);
  enemyGraphics.fillCircle(20, 20, 20);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();
}

function create() {
  gameStartTime = this.time.now;

  // 创建玩家（蓝色方块）
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setMaxVelocity(288, 288); // 240 * 1.2 = 288

  // 创建敌人（橙色圆形）
  enemy = this.physics.add.sprite(100, 100, 'enemy');
  enemy.setCollideWorldBounds(true);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加 WASD 控制
  this.wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });

  // 碰撞检测
  this.physics.add.overlap(player, enemy, handleCollision, null, this);

  // 状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(16, 560, 'Use Arrow Keys or WASD to move. Avoid the orange enemy!', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 更新存活时间
  survivalTime = Math.floor((time - gameStartTime) / 1000);

  // 玩家移动控制
  player.setVelocity(0);

  let moveX = 0;
  let moveY = 0;

  if (cursors.left.isDown || this.wasd.left.isDown) {
    moveX = -1;
  } else if (cursors.right.isDown || this.wasd.right.isDown) {
    moveX = 1;
  }

  if (cursors.up.isDown || this.wasd.up.isDown) {
    moveY = -1;
  } else if (cursors.down.isDown || this.wasd.down.isDown) {
    moveY = 1;
  }

  // 归一化对角线移动速度
  if (moveX !== 0 && moveY !== 0) {
    const normalizedSpeed = 288 / Math.sqrt(2);
    player.setVelocity(moveX * normalizedSpeed, moveY * normalizedSpeed);
  } else {
    player.setVelocity(moveX * 288, moveY * 288);
  }

  // 敌人追踪玩家（速度 240）
  this.physics.moveToObject(enemy, player, 240);

  // 更新状态显示
  statusText.setText([
    `Survival Time: ${survivalTime}s`,
    `Collisions: ${collisionCount}`,
    `Player Speed: 288`,
    `Enemy Speed: 240`
  ]);
}

function handleCollision(player, enemy) {
  collisionCount++;
  
  // 碰撞后将敌人随机重置到边缘位置
  const side = Phaser.Math.Between(0, 3);
  switch(side) {
    case 0: // 上边
      enemy.setPosition(Phaser.Math.Between(50, 750), 50);
      break;
    case 1: // 右边
      enemy.setPosition(750, Phaser.Math.Between(50, 550));
      break;
    case 2: // 下边
      enemy.setPosition(Phaser.Math.Between(50, 750), 550);
      break;
    case 3: // 左边
      enemy.setPosition(50, Phaser.Math.Between(50, 550));
      break;
  }

  // 短暂无敌时间效果
  player.setAlpha(0.5);
  this.time.delayedCall(500, () => {
    player.setAlpha(1);
  });
}

new Phaser.Game(config);
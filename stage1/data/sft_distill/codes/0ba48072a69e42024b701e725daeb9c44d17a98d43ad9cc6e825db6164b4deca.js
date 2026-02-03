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
let collisionCount = 0;
let distanceText;
let collisionText;
let statusText;

const PLAYER_SPEED = 300 * 1.2; // 360
const ENEMY_SPEED = 300;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（灰色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x808080, 1);
  enemyGraphics.fillCircle(20, 20, 20);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  
  // 创建敌人
  enemy = this.physics.add.sprite(100, 100, 'enemy');
  enemy.setCollideWorldBounds(true);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加 WASD 键支持
  this.wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });

  // 碰撞检测
  this.physics.add.overlap(player, enemy, onCollision, null, this);

  // 创建UI文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  distanceText = this.add.text(16, 50, '', {
    fontSize: '16px',
    fill: '#00ff00'
  });

  collisionText = this.add.text(16, 75, `Collisions: ${collisionCount}`, {
    fontSize: '16px',
    fill: '#ff0000'
  });

  // 添加说明文本
  this.add.text(16, 560, 'Use Arrow Keys or WASD to move. Player Speed: 360, Enemy Speed: 300', {
    fontSize: '14px',
    fill: '#ffff00'
  });
}

function update(time, delta) {
  // 重置玩家速度
  player.setVelocity(0);

  // 处理玩家移动（方向键）
  if (cursors.left.isDown || this.wasd.left.isDown) {
    player.setVelocityX(-PLAYER_SPEED);
  } else if (cursors.right.isDown || this.wasd.right.isDown) {
    player.setVelocityX(PLAYER_SPEED);
  }

  if (cursors.up.isDown || this.wasd.up.isDown) {
    player.setVelocityY(-PLAYER_SPEED);
  } else if (cursors.down.isDown || this.wasd.down.isDown) {
    player.setVelocityY(PLAYER_SPEED);
  }

  // 对角线移动时归一化速度
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.body.velocity.normalize().scale(PLAYER_SPEED);
  }

  // 敌人追踪玩家
  this.physics.moveToObject(enemy, player, ENEMY_SPEED);

  // 计算距离
  const distance = Phaser.Math.Distance.Between(
    player.x, player.y,
    enemy.x, enemy.y
  );

  // 更新UI
  statusText.setText(`Player Speed: ${PLAYER_SPEED.toFixed(0)} | Enemy Speed: ${ENEMY_SPEED}`);
  distanceText.setText(`Distance: ${distance.toFixed(1)}`);
  collisionText.setText(`Collisions: ${collisionCount}`);
}

function onCollision(player, enemy) {
  collisionCount++;
  
  // 碰撞后将敌人推开到随机位置
  const randomX = Phaser.Math.Between(50, 750);
  const randomY = Phaser.Math.Between(50, 550);
  enemy.setPosition(randomX, randomY);
  
  // 添加视觉反馈
  player.setTint(0xff0000);
  this.time.delayedCall(200, () => {
    player.clearTint();
  });
}

new Phaser.Game(config);
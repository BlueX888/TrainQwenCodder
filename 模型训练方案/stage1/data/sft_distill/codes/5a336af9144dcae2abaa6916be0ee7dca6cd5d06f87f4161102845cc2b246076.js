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
let wasd;
let distanceText;
let statusText;
let isCaught = false;
let survivalTime = 0;

function preload() {
  // 使用 Graphics 创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（青色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x00ffff, 1);
  enemyGraphics.fillCircle(20, 20, 20);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人精灵
  enemy = this.physics.add.sprite(100, 100, 'enemy');
  enemy.setCollideWorldBounds(true);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });

  // 添加碰撞检测
  this.physics.add.overlap(player, enemy, onCatch, null, this);

  // 创建状态文本
  statusText = this.add.text(16, 16, 'Status: Escaping', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  distanceText = this.add.text(16, 50, 'Distance: 0', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(16, 550, 'Controls: Arrow Keys or WASD | Player Speed: 240 | Enemy Speed: 200', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });
}

function update(time, delta) {
  if (isCaught) {
    return;
  }

  // 更新生存时间
  survivalTime += delta;

  // 玩家移动逻辑（速度 200 * 1.2 = 240）
  const playerSpeed = 240;
  player.setVelocity(0);

  if (cursors.left.isDown || wasd.left.isDown) {
    player.setVelocityX(-playerSpeed);
  } else if (cursors.right.isDown || wasd.right.isDown) {
    player.setVelocityX(playerSpeed);
  }

  if (cursors.up.isDown || wasd.up.isDown) {
    player.setVelocityY(-playerSpeed);
  } else if (cursors.down.isDown || wasd.down.isDown) {
    player.setVelocityY(playerSpeed);
  }

  // 对角线移动时归一化速度
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.body.velocity.normalize().scale(playerSpeed);
  }

  // 敌人追踪玩家逻辑（速度 200）
  const enemySpeed = 200;
  this.physics.moveToObject(enemy, player, enemySpeed);

  // 计算并显示距离
  const distance = Phaser.Math.Distance.Between(
    player.x, player.y,
    enemy.x, enemy.y
  );
  distanceText.setText(`Distance: ${Math.round(distance)}px`);

  // 更新状态文本
  const survivalSeconds = (survivalTime / 1000).toFixed(1);
  statusText.setText(`Status: Escaping | Time: ${survivalSeconds}s`);
}

function onCatch() {
  if (isCaught) return;
  
  isCaught = true;
  
  // 停止所有移动
  player.setVelocity(0);
  enemy.setVelocity(0);

  // 更新状态
  const survivalSeconds = (survivalTime / 1000).toFixed(1);
  statusText.setText(`Status: CAUGHT! | Survived: ${survivalSeconds}s`);
  statusText.setStyle({ fill: '#ff0000', fontSize: '24px' });

  // 添加游戏结束文本
  this.add.text(400, 300, 'CAUGHT!', {
    fontSize: '64px',
    fill: '#ff0000',
    stroke: '#000000',
    strokeThickness: 6
  }).setOrigin(0.5);

  this.add.text(400, 370, 'Refresh to restart', {
    fontSize: '24px',
    fill: '#ffffff'
  }).setOrigin(0.5);
}

const game = new Phaser.Game(config);
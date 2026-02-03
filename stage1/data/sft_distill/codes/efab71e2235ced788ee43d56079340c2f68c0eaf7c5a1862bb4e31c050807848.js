// 完整的 Phaser3 代码 - 敌人追踪玩家游戏
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
let statusText;
let distanceText;
let gameState = {
  isAlive: true,
  survivalTime: 0,
  distance: 0
};

const PLAYER_SPEED = 120 * 1.2; // 144
const ENEMY_SPEED = 120;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（绿色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x00ff00, 1);
  enemyGraphics.fillCircle(20, 20, 20);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家精灵（初始位置在中心）
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人精灵（初始位置在左上角）
  enemy = this.physics.add.sprite(100, 100, 'enemy');
  enemy.setCollideWorldBounds(true);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加碰撞检测
  this.physics.add.overlap(player, enemy, onCatch, null, this);

  // 创建状态文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 创建距离文本
  distanceText = this.add.text(16, 50, '', {
    fontSize: '16px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(400, 16, '使用方向键移动 | 蓝色=玩家(速度144) | 绿色=敌人(速度120)', {
    fontSize: '14px',
    fill: '#cccccc'
  }).setOrigin(0.5, 0);

  updateStatusText();
}

function update(time, delta) {
  if (!gameState.isAlive) {
    return;
  }

  // 更新存活时间
  gameState.survivalTime += delta / 1000;

  // 玩家移动控制
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-PLAYER_SPEED);
  } else if (cursors.right.isDown) {
    player.setVelocityX(PLAYER_SPEED);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-PLAYER_SPEED);
  } else if (cursors.down.isDown) {
    player.setVelocityY(PLAYER_SPEED);
  }

  // 对角线移动时归一化速度
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.body.velocity.normalize().scale(PLAYER_SPEED);
  }

  // 敌人追踪玩家
  this.physics.moveToObject(enemy, player, ENEMY_SPEED);

  // 计算并更新距离
  gameState.distance = Phaser.Math.Distance.Between(
    player.x, player.y,
    enemy.x, enemy.y
  );

  updateStatusText();
}

function onCatch() {
  if (!gameState.isAlive) {
    return;
  }

  gameState.isAlive = false;
  
  // 停止所有移动
  player.setVelocity(0);
  enemy.setVelocity(0);

  // 改变玩家颜色表示被抓住
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('playerCaught', 32, 32);
  graphics.destroy();
  player.setTexture('playerCaught');

  updateStatusText();

  // 显示游戏结束文本
  this.add.text(400, 300, '被抓住了！\n按 R 重新开始', {
    fontSize: '32px',
    fill: '#ff0000',
    backgroundColor: '#000000',
    padding: { x: 20, y: 10 },
    align: 'center'
  }).setOrigin(0.5);

  // 添加重启功能
  this.input.keyboard.once('keydown-R', () => {
    this.scene.restart();
    gameState = {
      isAlive: true,
      survivalTime: 0,
      distance: 0
    };
  });
}

function updateStatusText() {
  const status = gameState.isAlive ? '存活中' : '已被抓住';
  const time = gameState.survivalTime.toFixed(1);
  statusText.setText(`状态: ${status} | 存活时间: ${time}秒`);
  
  const dist = Math.floor(gameState.distance);
  const safeZone = dist > 100 ? '安全' : '危险';
  distanceText.setText(`与敌人距离: ${dist}px (${safeZone})`);
}

// 启动游戏
new Phaser.Game(config);
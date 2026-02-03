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
  survivedTime: 0,
  catchCount: 0,
  distance: 0
};

const PLAYER_SPEED = 120 * 1.2; // 144
const ENEMY_SPEED = 120;

function preload() {
  // 使用 Graphics 创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0099ff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（黄色方块）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xffff00, 1);
  enemyGraphics.fillRect(0, 0, 32, 32);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();

  // 创建玩家精灵（位于中心）
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人精灵（随机位置）
  const spawnX = Phaser.Math.Between(0, 1) === 0 ? 100 : 700;
  const spawnY = Phaser.Math.Between(0, 1) === 0 ? 100 : 500;
  enemy = this.physics.add.sprite(spawnX, spawnY, 'enemy');

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加碰撞检测
  this.physics.add.overlap(player, enemy, onCatch, null, this);

  // 创建状态显示文本
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

  // 添加说明文本
  this.add.text(400, 16, '使用方向键移动 | 蓝色:玩家(速度144) | 黄色:敌人(速度120)', {
    fontSize: '14px',
    fill: '#cccccc'
  }).setOrigin(0.5, 0);

  // 初始化游戏状态
  gameState.isAlive = true;
  gameState.survivedTime = 0;
  gameState.catchCount = 0;
}

function update(time, delta) {
  if (!gameState.isAlive) {
    return;
  }

  // 更新存活时间
  gameState.survivedTime += delta;

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

  // 对角线移动速度归一化
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.body.velocity.normalize().scale(PLAYER_SPEED);
  }

  // 敌人追踪玩家
  this.physics.moveToObject(enemy, player, ENEMY_SPEED);

  // 计算距离
  gameState.distance = Phaser.Math.Distance.Between(
    player.x, player.y,
    enemy.x, enemy.y
  );

  // 更新显示
  updateDisplay();
}

function onCatch(player, enemy) {
  if (gameState.isAlive) {
    gameState.catchCount++;
    gameState.isAlive = false;

    // 停止所有移动
    player.setVelocity(0);
    enemy.setVelocity(0);

    // 视觉反馈
    player.setTint(0xff0000);
    
    statusText.setText(
      `游戏结束!\n` +
      `被抓住次数: ${gameState.catchCount}\n` +
      `存活时间: ${(gameState.survivedTime / 1000).toFixed(2)}秒\n` +
      `按 R 重新开始`
    );

    // 添加重新开始功能
    player.scene.input.keyboard.once('keydown-R', () => {
      player.scene.scene.restart();
    });
  }
}

function updateDisplay() {
  const surviveTime = (gameState.survivedTime / 1000).toFixed(1);
  
  statusText.setText(
    `状态: ${gameState.isAlive ? '存活' : '被抓'} | ` +
    `时间: ${surviveTime}s | ` +
    `被抓次数: ${gameState.catchCount}`
  );

  distanceText.setText(
    `距离: ${gameState.distance.toFixed(0)}px\n` +
    `玩家速度: ${PLAYER_SPEED} | 敌人速度: ${ENEMY_SPEED}\n` +
    `速度比: ${(PLAYER_SPEED / ENEMY_SPEED).toFixed(2)}x`
  );
}

new Phaser.Game(config);
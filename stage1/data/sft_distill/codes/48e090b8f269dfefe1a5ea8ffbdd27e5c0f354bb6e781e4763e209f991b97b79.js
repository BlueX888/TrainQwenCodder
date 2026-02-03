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

// 游戏状态信号
let gameState = {
  score: 0,
  health: 100,
  escaped: 0,
  caught: 0,
  distance: 0
};

let player;
let enemy;
let cursors;
let statusText;
let distanceText;

const PLAYER_SPEED = 300 * 1.2; // 360
const ENEMY_SPEED = 300;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('playerTex', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（灰色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x808080, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemyTex', 32, 32);
  enemyGraphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'playerTex');
  player.setCollideWorldBounds(true);

  // 创建敌人精灵（从左上角开始）
  enemy = this.physics.add.sprite(50, 50, 'enemyTex');
  enemy.setCollideWorldBounds(true);

  // 创建键盘输入
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

  distanceText = this.add.text(16, 60, '', {
    fontSize: '16px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(16, 550, '使用方向键移动 | 绿色=玩家(速度360) | 灰色=敌人(速度300)', {
    fontSize: '14px',
    fill: '#aaaaaa'
  });

  updateStatusText();
}

function update(time, delta) {
  // 重置玩家速度
  player.setVelocity(0);

  // 玩家移动控制
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
    player.setVelocity(
      player.body.velocity.x * 0.707,
      player.body.velocity.y * 0.707
    );
  }

  // 敌人追踪玩家
  this.physics.moveToObject(enemy, player, ENEMY_SPEED);

  // 计算距离
  const distance = Phaser.Math.Distance.Between(
    player.x, player.y,
    enemy.x, enemy.y
  );
  gameState.distance = Math.floor(distance);

  // 更新距离显示
  distanceText.setText(`距离: ${gameState.distance}px`);

  // 如果玩家成功逃离（距离超过500）
  if (distance > 500 && gameState.distance > 0) {
    gameState.escaped++;
    gameState.score += 10;
    resetPositions();
    updateStatusText();
  }
}

function onCatch(player, enemy) {
  // 被抓住
  gameState.caught++;
  gameState.health -= 10;
  gameState.score = Math.max(0, gameState.score - 5);
  
  resetPositions();
  updateStatusText();
}

function resetPositions() {
  // 重置位置
  player.setPosition(400, 300);
  player.setVelocity(0);
  
  // 敌人随机从边缘出现
  const side = Phaser.Math.Between(0, 3);
  switch(side) {
    case 0: // 上
      enemy.setPosition(Phaser.Math.Between(50, 750), 50);
      break;
    case 1: // 右
      enemy.setPosition(750, Phaser.Math.Between(50, 550));
      break;
    case 2: // 下
      enemy.setPosition(Phaser.Math.Between(50, 750), 550);
      break;
    case 3: // 左
      enemy.setPosition(50, Phaser.Math.Between(50, 550));
      break;
  }
  enemy.setVelocity(0);
}

function updateStatusText() {
  statusText.setText(
    `分数: ${gameState.score} | 生命: ${gameState.health} | ` +
    `逃脱: ${gameState.escaped} | 被抓: ${gameState.caught}`
  );
}

new Phaser.Game(config);
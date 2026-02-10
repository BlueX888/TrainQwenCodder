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

// 游戏状态变量（可验证的状态信号）
let player;
let ai;
let collectibles;
let cursors;
let score = 0;
let gameOver = false;
let gameWon = false;
let statusText;
let scoreText;

// 固定随机种子以保证确定性
let seed = 12345;
function seededRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

function preload() {
  // 创建纹理
  createTextures(this);
}

function create() {
  // 重置游戏状态
  score = 0;
  gameOver = false;
  gameWon = false;

  // 创建玩家（绿色方块）
  player = this.physics.add.sprite(100, 300, 'playerTex');
  player.setCollideWorldBounds(true);
  player.setMaxVelocity(200, 200);
  player.setDrag(500, 500);

  // 创建 AI（蓝色圆形）
  ai = this.physics.add.sprite(700, 300, 'aiTex');
  ai.setCollideWorldBounds(true);

  // 创建可收集物品组
  collectibles = this.physics.add.group();
  for (let i = 0; i < 5; i++) {
    const x = 150 + seededRandom() * 500;
    const y = 100 + seededRandom() * 400;
    const item = collectibles.create(x, y, 'itemTex');
    item.setCircle(10);
  }

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 碰撞检测
  this.physics.add.overlap(player, collectibles, collectItem, null, this);
  this.physics.add.overlap(player, ai, hitAI, null, this);

  // UI 文本
  scoreText = this.add.text(16, 16, 'Collected: 0/5', {
    fontSize: '24px',
    fill: '#ffffff'
  });

  statusText = this.add.text(400, 300, '', {
    fontSize: '48px',
    fill: '#ffffff',
    fontStyle: 'bold'
  });
  statusText.setOrigin(0.5);
  statusText.setVisible(false);
}

function update(time, delta) {
  if (gameOver || gameWon) {
    // 游戏结束，停止所有移动
    player.setVelocity(0, 0);
    ai.setVelocity(0, 0);
    return;
  }

  // 玩家控制
  const acceleration = 400;
  
  if (cursors.left.isDown) {
    player.setAccelerationX(-acceleration);
  } else if (cursors.right.isDown) {
    player.setAccelerationX(acceleration);
  } else {
    player.setAccelerationX(0);
  }

  if (cursors.up.isDown) {
    player.setAccelerationY(-acceleration);
  } else if (cursors.down.isDown) {
    player.setAccelerationY(acceleration);
  } else {
    player.setAccelerationY(0);
  }

  // AI 追踪玩家（360 速度）
  this.physics.moveToObject(ai, player, 360);
}

function collectItem(player, item) {
  item.destroy();
  score++;
  scoreText.setText('Collected: ' + score + '/5');

  // 检查是否获胜
  if (score >= 5) {
    gameWon = true;
    statusText.setText('YOU WIN!');
    statusText.setFill('#00ff00');
    statusText.setVisible(true);
    console.log('Game Won! Score:', score);
  }
}

function hitAI(player, ai) {
  if (!gameOver && !gameWon) {
    gameOver = true;
    statusText.setText('GAME OVER!');
    statusText.setFill('#ff0000');
    statusText.setVisible(true);
    console.log('Game Over! Score:', score);
  }
}

function createTextures(scene) {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = scene.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('playerTex', 32, 32);
  playerGraphics.destroy();

  // 创建 AI 纹理（蓝色圆形）
  const aiGraphics = scene.add.graphics();
  aiGraphics.fillStyle(0x0088ff, 1);
  aiGraphics.fillCircle(20, 20, 20);
  aiGraphics.generateTexture('aiTex', 40, 40);
  aiGraphics.destroy();

  // 创建物品纹理（黄色圆形）
  const itemGraphics = scene.add.graphics();
  itemGraphics.fillStyle(0xffff00, 1);
  itemGraphics.fillCircle(10, 10, 10);
  itemGraphics.generateTexture('itemTex', 20, 20);
  itemGraphics.destroy();
}

// 启动游戏
new Phaser.Game(config);
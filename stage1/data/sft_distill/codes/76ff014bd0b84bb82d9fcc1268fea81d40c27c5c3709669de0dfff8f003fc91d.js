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

// 游戏状态变量
let player;
let aiEnemy;
let collectibles;
let cursors;
let scoreText;
let statusText;
let score = 0;
let gameOver = false;
let gameWon = false;
const TOTAL_COLLECTIBLES = 5;
const AI_SPEED = 360;
const PLAYER_SPEED = 250;

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

  // 创建 AI 纹理（蓝色方块）
  const aiGraphics = this.add.graphics();
  aiGraphics.fillStyle(0x0088ff, 1);
  aiGraphics.fillRect(0, 0, 32, 32);
  aiGraphics.generateTexture('ai', 32, 32);
  aiGraphics.destroy();

  // 创建收集物纹理（黄色圆形）
  const collectibleGraphics = this.add.graphics();
  collectibleGraphics.fillStyle(0xffff00, 1);
  collectibleGraphics.fillCircle(12, 12, 12);
  collectibleGraphics.generateTexture('collectible', 24, 24);
  collectibleGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(100, 100, 'player');
  player.setCollideWorldBounds(true);

  // 创建 AI 敌人
  aiEnemy = this.physics.add.sprite(700, 500, 'ai');
  aiEnemy.setCollideWorldBounds(true);

  // 创建收集物品组
  collectibles = this.physics.add.group();
  
  // 使用固定种子生成收集物位置（保证确定性）
  const positions = [
    { x: 400, y: 300 },
    { x: 200, y: 500 },
    { x: 600, y: 150 },
    { x: 150, y: 300 },
    { x: 650, y: 450 }
  ];

  positions.forEach(pos => {
    const collectible = collectibles.create(pos.x, pos.y, 'collectible');
    collectible.setCircle(12);
  });

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 设置碰撞检测
  this.physics.add.overlap(player, collectibles, collectItem, null, this);
  this.physics.add.overlap(player, aiEnemy, hitAI, null, this);

  // 创建 UI 文本
  scoreText = this.add.text(16, 16, `收集进度: ${score}/${TOTAL_COLLECTIBLES}`, {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  statusText = this.add.text(400, 300, '', {
    fontSize: '48px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });
  statusText.setOrigin(0.5);
  statusText.setVisible(false);

  // 添加边界线（可选，帮助视觉识别）
  const graphics = this.add.graphics();
  graphics.lineStyle(2, 0x00ff00, 0.3);
  graphics.strokeRect(0, 0, 800, 600);
}

function update(time, delta) {
  if (gameOver || gameWon) {
    player.setVelocity(0, 0);
    aiEnemy.setVelocity(0, 0);
    return;
  }

  // 玩家移动控制
  player.setVelocity(0, 0);

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

  // AI 追踪玩家
  this.physics.moveToObject(aiEnemy, player, AI_SPEED);
}

// 收集物品回调
function collectItem(player, collectible) {
  collectible.disableBody(true, true);
  score++;
  scoreText.setText(`收集进度: ${score}/${TOTAL_COLLECTIBLES}`);

  // 检查胜利条件
  if (score >= TOTAL_COLLECTIBLES) {
    gameWon = true;
    statusText.setText('胜利！\n收集完成！');
    statusText.setFill('#00ff00');
    statusText.setVisible(true);
    this.physics.pause();
  }
}

// 碰到 AI 回调
function hitAI(player, aiEnemy) {
  if (!gameOver && !gameWon) {
    gameOver = true;
    statusText.setText('失败！\n被 AI 抓住了！');
    statusText.setFill('#ff0000');
    statusText.setVisible(true);
    this.physics.pause();
    
    // 玩家变红表示失败
    player.setTint(0xff0000);
  }
}

// 启动游戏
new Phaser.Game(config);
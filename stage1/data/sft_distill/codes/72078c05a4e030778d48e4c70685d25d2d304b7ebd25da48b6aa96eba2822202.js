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

// 游戏状态变量（可验证）
let player;
let aiEnemy;
let collectibles;
let cursors;
let score = 0;
let scoreText;
let gameOverText;
let gameState = 'playing'; // 'playing', 'win', 'lose'
const PLAYER_SPEED = 200;
const AI_SPEED = 160;
const ITEMS_TO_WIN = 15;

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

  // 创建AI纹理（紫色方块）
  const aiGraphics = this.add.graphics();
  aiGraphics.fillStyle(0x9933ff, 1);
  aiGraphics.fillRect(0, 0, 32, 32);
  aiGraphics.generateTexture('aiTex', 32, 32);
  aiGraphics.destroy();

  // 创建收集物品纹理（黄色圆形）
  const itemGraphics = this.add.graphics();
  itemGraphics.fillStyle(0xffff00, 1);
  itemGraphics.fillCircle(12, 12, 12);
  itemGraphics.generateTexture('itemTex', 24, 24);
  itemGraphics.destroy();

  // 创建玩家（起始位置：左上角）
  player = this.physics.add.sprite(100, 100, 'playerTex');
  player.setCollideWorldBounds(true);

  // 创建AI敌人（起始位置：右下角）
  aiEnemy = this.physics.add.sprite(700, 500, 'aiTex');
  aiEnemy.setCollideWorldBounds(true);

  // 创建收集物品组
  collectibles = this.physics.add.group();
  
  // 使用固定种子生成物品位置（保证确定性）
  const positions = [
    {x: 400, y: 300}, {x: 200, y: 200}, {x: 600, y: 400},
    {x: 150, y: 450}, {x: 650, y: 150}, {x: 300, y: 500},
    {x: 500, y: 100}, {x: 100, y: 300}, {x: 700, y: 300},
    {x: 400, y: 150}, {x: 250, y: 350}, {x: 550, y: 250},
    {x: 350, y: 450}, {x: 450, y: 350}, {x: 200, y: 550}
  ];

  for (let i = 0; i < ITEMS_TO_WIN; i++) {
    const item = collectibles.create(positions[i].x, positions[i].y, 'itemTex');
    item.setCollideWorldBounds(true);
  }

  // 设置碰撞检测
  this.physics.add.overlap(player, collectibles, collectItem, null, this);
  this.physics.add.overlap(player, aiEnemy, hitByAI, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建UI文本
  scoreText = this.add.text(16, 16, 'Score: 0 / ' + ITEMS_TO_WIN, {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  gameOverText = this.add.text(400, 300, '', {
    fontSize: '48px',
    fill: '#ffffff',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 4
  });
  gameOverText.setOrigin(0.5);
  gameOverText.setVisible(false);
}

function update(time, delta) {
  if (gameState !== 'playing') {
    return;
  }

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

  // AI追踪玩家
  this.physics.moveToObject(aiEnemy, player, AI_SPEED);
}

function collectItem(player, item) {
  // 收集物品
  item.destroy();
  score++;
  scoreText.setText('Score: ' + score + ' / ' + ITEMS_TO_WIN);

  // 检查是否获胜
  if (score >= ITEMS_TO_WIN) {
    gameState = 'win';
    player.setVelocity(0);
    aiEnemy.setVelocity(0);
    gameOverText.setText('YOU WIN!');
    gameOverText.setFill('#00ff00');
    gameOverText.setVisible(true);
  }
}

function hitByAI(player, ai) {
  // 被AI碰到，游戏失败
  if (gameState === 'playing') {
    gameState = 'lose';
    player.setVelocity(0);
    aiEnemy.setVelocity(0);
    gameOverText.setText('GAME OVER!');
    gameOverText.setFill('#ff0000');
    gameOverText.setVisible(true);
  }
}

// 启动游戏
const game = new Phaser.Game(config);
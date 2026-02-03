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
let items;
let cursors;
let scoreText;
let statusText;
let score = 0;
let gameOver = false;
let gameWon = false;

const PLAYER_SPEED = 200;
const AI_SPEED = 360;
const TOTAL_ITEMS = 20;

function preload() {
  // 使用Graphics创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0000ff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建AI纹理（绿色方块）
  const aiGraphics = this.add.graphics();
  aiGraphics.fillStyle(0x00ff00, 1);
  aiGraphics.fillRect(0, 0, 32, 32);
  aiGraphics.generateTexture('ai', 32, 32);
  aiGraphics.destroy();

  // 创建物品纹理（黄色圆圈）
  const itemGraphics = this.add.graphics();
  itemGraphics.fillStyle(0xffff00, 1);
  itemGraphics.fillCircle(8, 8, 8);
  itemGraphics.generateTexture('item', 16, 16);
  itemGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(100, 100, 'player');
  player.setCollideWorldBounds(true);

  // 创建AI敌人
  aiEnemy = this.physics.add.sprite(700, 500, 'ai');
  aiEnemy.setCollideWorldBounds(true);

  // 创建物品组
  items = this.physics.add.group();
  
  // 使用固定种子生成随机位置（确保确定性）
  const seed = 12345;
  let randomState = seed;
  
  function seededRandom() {
    randomState = (randomState * 9301 + 49297) % 233280;
    return randomState / 233280;
  }

  // 生成20个物品
  for (let i = 0; i < TOTAL_ITEMS; i++) {
    const x = 50 + seededRandom() * 700;
    const y = 50 + seededRandom() * 500;
    const item = items.create(x, y, 'item');
    item.setCollideWorldBounds(true);
  }

  // 设置碰撞检测
  this.physics.add.overlap(player, items, collectItem, null, this);
  this.physics.add.overlap(player, aiEnemy, hitAI, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建UI文本
  scoreText = this.add.text(16, 16, 'Score: 0 / 20', {
    fontSize: '24px',
    fill: '#ffffff'
  });

  statusText = this.add.text(400, 300, '', {
    fontSize: '48px',
    fill: '#ffffff',
    align: 'center'
  });
  statusText.setOrigin(0.5);

  // 添加说明文本
  this.add.text(16, 550, 'Use Arrow Keys to move | Collect 20 items to win | Avoid the green AI!', {
    fontSize: '16px',
    fill: '#cccccc'
  });
}

function update() {
  if (gameOver || gameWon) {
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

  // AI追踪玩家逻辑
  this.physics.moveToObject(aiEnemy, player, AI_SPEED);
}

function collectItem(player, item) {
  // 收集物品
  item.destroy();
  score++;
  
  scoreText.setText('Score: ' + score + ' / 20');

  // 检查是否获胜
  if (score >= TOTAL_ITEMS) {
    gameWon = true;
    player.setVelocity(0);
    aiEnemy.setVelocity(0);
    statusText.setText('YOU WIN!\nCollected all items!');
    statusText.setStyle({ fill: '#00ff00' });
  }
}

function hitAI(player, aiEnemy) {
  // 被AI碰到，游戏失败
  if (!gameOver && !gameWon) {
    gameOver = true;
    player.setVelocity(0);
    aiEnemy.setVelocity(0);
    player.setTint(0xff0000);
    statusText.setText('GAME OVER!\nCaught by AI!');
    statusText.setStyle({ fill: '#ff0000' });
  }
}

new Phaser.Game(config);
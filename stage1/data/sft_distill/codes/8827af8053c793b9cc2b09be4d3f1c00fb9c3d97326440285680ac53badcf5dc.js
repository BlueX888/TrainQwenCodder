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
const AI_SPEED = 160;
const TOTAL_ITEMS = 15;

function preload() {
  // 使用Graphics创建纹理，无需外部资源
}

function create() {
  // 重置游戏状态
  score = 0;
  gameOver = false;
  gameWon = false;

  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
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
  itemGraphics.fillCircle(12, 12, 12);
  itemGraphics.generateTexture('item', 24, 24);
  itemGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(100, 100, 'player');
  player.setCollideWorldBounds(true);

  // 创建AI敌人
  aiEnemy = this.physics.add.sprite(700, 500, 'ai');
  aiEnemy.setCollideWorldBounds(true);

  // 创建物品组
  items = this.physics.add.group();
  
  // 使用固定种子生成物品位置（确保确定性）
  const seed = 12345;
  let randomValue = seed;
  
  for (let i = 0; i < TOTAL_ITEMS; i++) {
    // 简单的伪随机数生成器
    randomValue = (randomValue * 9301 + 49297) % 233280;
    const x = 50 + (randomValue / 233280) * 700;
    
    randomValue = (randomValue * 9301 + 49297) % 233280;
    const y = 50 + (randomValue / 233280) * 500;
    
    const item = items.create(x, y, 'item');
    item.setCircle(12);
  }

  // 设置碰撞检测
  this.physics.add.overlap(player, items, collectItem, null, this);
  this.physics.add.overlap(player, aiEnemy, hitAI, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建UI文本
  scoreText = this.add.text(16, 16, `收集: ${score}/${TOTAL_ITEMS}`, {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  statusText = this.add.text(400, 300, '', {
    fontSize: '48px',
    fill: '#ffffff',
    fontFamily: 'Arial',
    align: 'center'
  });
  statusText.setOrigin(0.5);
  statusText.setVisible(false);
}

function update() {
  if (gameOver || gameWon) {
    // 游戏结束，停止所有移动
    player.setVelocity(0);
    aiEnemy.setVelocity(0);
    return;
  }

  // 玩家控制
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

  // AI追踪玩家
  this.physics.moveToObject(aiEnemy, player, AI_SPEED);
}

function collectItem(player, item) {
  // 收集物品
  item.destroy();
  score++;
  scoreText.setText(`收集: ${score}/${TOTAL_ITEMS}`);

  // 检查胜利条件
  if (score >= TOTAL_ITEMS) {
    gameWon = true;
    statusText.setText('胜利！\n收集完成！');
    statusText.setFill('#00ff00');
    statusText.setVisible(true);
  }
}

function hitAI(player, aiEnemy) {
  // 被AI碰到，游戏失败
  if (!gameOver && !gameWon) {
    gameOver = true;
    statusText.setText('失败！\n被AI抓住了！');
    statusText.setFill('#ff0000');
    statusText.setVisible(true);
    
    // 玩家变红表示失败
    player.setTint(0xff0000);
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态变量用于验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { score, gameOver, gameWon };
}
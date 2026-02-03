// 全局 signals 用于验证游戏状态
window.__signals__ = {
  score: 0,
  gameOver: false,
  gameWon: false,
  aiSpeed: 80,
  playerX: 0,
  playerY: 0,
  aiX: 0,
  aiY: 0,
  itemsCollected: 0,
  totalItems: 8,
  events: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.ai = null;
    this.items = null;
    this.score = 0;
    this.scoreText = null;
    this.gameOverText = null;
    this.cursors = null;
    this.gameOver = false;
    this.AI_SPEED = 80;
    this.PLAYER_SPEED = 150;
  }

  preload() {
    // 创建纹理
    this.createTextures();
  }

  createTextures() {
    // 玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // AI 纹理（绿色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x00ff00, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 物品纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#222222');

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建 AI（从左上角开始）
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    this.createItems();

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitByAI, null, this);

    // 创建 UI 文本
    this.scoreText = this.add.text(16, 16, 'Score: 0/8', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    this.gameOverText.setOrigin(0.5);

    // 初始化 signals
    this.updateSignals();
    window.__signals__.events.push({
      type: 'game_start',
      timestamp: Date.now()
    });
  }

  createItems() {
    // 使用固定种子生成物品位置（确保可重现）
    const positions = [
      { x: 200, y: 150 },
      { x: 600, y: 150 },
      { x: 200, y: 450 },
      { x: 600, y: 450 },
      { x: 100, y: 300 },
      { x: 700, y: 300 },
      { x: 400, y: 100 },
      { x: 400, y: 500 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setCollideWorldBounds(true);
    });
  }

  collectItem(player, item) {
    if (this.gameOver) return;

    item.destroy();
    this.score++;
    this.scoreText.setText(`Score: ${this.score}/8`);

    window.__signals__.score = this.score;
    window.__signals__.itemsCollected = this.score;
    window.__signals__.events.push({
      type: 'item_collected',
      score: this.score,
      timestamp: Date.now()
    });

    // 检查胜利条件
    if (this.score >= 8) {
      this.winGame();
    }
  }

  hitByAI(player, ai) {
    if (this.gameOver) return;

    this.gameOver = true;
    this.physics.pause();
    
    this.gameOverText.setText('GAME OVER!\nAI Caught You!');
    this.gameOverText.setStyle({ fill: '#ff0000' });

    window.__signals__.gameOver = true;
    window.__signals__.gameWon = false;
    window.__signals__.events.push({
      type: 'game_over',
      reason: 'caught_by_ai',
      score: this.score,
      timestamp: Date.now()
    });

    console.log('GAME OVER - Caught by AI');
    console.log(JSON.stringify(window.__signals__, null, 2));
  }

  winGame() {
    this.gameOver = true;
    this.physics.pause();
    
    this.gameOverText.setText('YOU WIN!\nAll Items Collected!');
    this.gameOverText.setStyle({ fill: '#00ff00' });

    window.__signals__.gameOver = true;
    window.__signals__.gameWon = true;
    window.__signals__.events.push({
      type: 'game_win',
      score: this.score,
      timestamp: Date.now()
    });

    console.log('GAME WIN - All items collected');
    console.log(JSON.stringify(window.__signals__, null, 2));
  }

  updatePlayerMovement() {
    if (this.gameOver) return;

    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.PLAYER_SPEED);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.PLAYER_SPEED);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.PLAYER_SPEED);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.PLAYER_SPEED);
    }
  }

  updateAIMovement() {
    if (this.gameOver) return;

    // 计算 AI 到玩家的角度
    const angle = Phaser.Math.Angle.Between(
      this.ai.x,
      this.ai.y,
      this.player.x,
      this.player.y
    );

    // 设置 AI 速度朝向玩家
    this.physics.velocityFromRotation(angle, this.AI_SPEED, this.ai.body.velocity);
  }

  updateSignals() {
    window.__signals__.score = this.score;
    window.__signals__.gameOver = this.gameOver;
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.aiX = Math.round(this.ai.x);
    window.__signals__.aiY = Math.round(this.ai.y);
    window.__signals__.itemsCollected = this.score;
  }

  update(time, delta) {
    this.updatePlayerMovement();
    this.updateAIMovement();
    this.updateSignals();
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

// 启动游戏
const game = new Phaser.Game(config);
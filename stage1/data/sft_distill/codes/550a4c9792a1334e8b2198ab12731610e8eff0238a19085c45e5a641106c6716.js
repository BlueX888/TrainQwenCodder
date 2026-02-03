// 全局信号记录
window.__signals__ = {
  gameState: 'playing', // playing, win, lose
  score: 0,
  itemsCollected: 0,
  totalItems: 8,
  playerPosition: { x: 0, y: 0 },
  aiPosition: { x: 0, y: 0 },
  events: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.AI_SPEED = 80;
    this.PLAYER_SPEED = 150;
    this.TOTAL_ITEMS = 8;
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

    // AI纹理（绿色方块）
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
    // 初始化游戏状态
    this.gameOver = false;
    this.score = 0;

    // 创建玩家
    this.player = this.physics.add.sprite(100, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建AI
    this.ai = this.physics.add.sprite(700, 300, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    this.createItems();

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitByAI, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 8', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(400, 16, 'Collect all items!', {
      fontSize: '24px',
      fill: '#ffffff'
    });
    this.statusText.setOrigin(0.5, 0);

    // 添加边界
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(0, 0, 800, 600);

    // 记录初始状态
    this.logEvent('game_start', {
      playerPos: { x: this.player.x, y: this.player.y },
      aiPos: { x: this.ai.x, y: this.ai.y }
    });

    // 更新signals
    this.updateSignals();
  }

  createItems() {
    // 使用固定种子生成物品位置
    const positions = [
      { x: 200, y: 150 },
      { x: 400, y: 100 },
      { x: 600, y: 150 },
      { x: 150, y: 450 },
      { x: 350, y: 500 },
      { x: 550, y: 450 },
      { x: 650, y: 300 },
      { x: 250, y: 300 }
    ];

    positions.forEach((pos, index) => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setData('id', index);
    });
  }

  collectItem(player, item) {
    if (this.gameOver) return;

    item.destroy();
    this.score++;

    this.logEvent('item_collected', {
      itemId: item.getData('id'),
      score: this.score,
      position: { x: item.x, y: item.y }
    });

    this.scoreText.setText(`Score: ${this.score} / ${this.TOTAL_ITEMS}`);

    if (this.score >= this.TOTAL_ITEMS) {
      this.winGame();
    }

    this.updateSignals();
  }

  hitByAI(player, ai) {
    if (this.gameOver) return;

    this.loseGame();
  }

  winGame() {
    this.gameOver = true;
    window.__signals__.gameState = 'win';

    this.statusText.setText('YOU WIN!');
    this.statusText.setStyle({ fill: '#00ff00', fontSize: '32px' });

    this.player.setTint(0x00ff00);
    this.physics.pause();

    this.logEvent('game_win', {
      finalScore: this.score,
      playerPos: { x: this.player.x, y: this.player.y }
    });

    this.updateSignals();
  }

  loseGame() {
    this.gameOver = true;
    window.__signals__.gameState = 'lose';

    this.statusText.setText('GAME OVER - Hit by AI!');
    this.statusText.setStyle({ fill: '#ff0000', fontSize: '32px' });

    this.player.setTint(0xff0000);
    this.physics.pause();

    this.logEvent('game_lose', {
      score: this.score,
      playerPos: { x: this.player.x, y: this.player.y },
      aiPos: { x: this.ai.x, y: this.ai.y }
    });

    this.updateSignals();
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 玩家移动
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

    // AI追踪玩家
    this.physics.moveToObject(this.ai, this.player, this.AI_SPEED);

    // 定期更新signals（每秒一次）
    if (!this.lastSignalUpdate || time - this.lastSignalUpdate > 1000) {
      this.lastSignalUpdate = time;
      this.updateSignals();
    }
  }

  updateSignals() {
    window.__signals__.score = this.score;
    window.__signals__.itemsCollected = this.score;
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
    window.__signals__.aiPosition = {
      x: Math.round(this.ai.x),
      y: Math.round(this.ai.y)
    };
  }

  logEvent(eventType, data) {
    const event = {
      timestamp: Date.now(),
      type: eventType,
      data: data
    };
    window.__signals__.events.push(event);
    console.log('[GAME EVENT]', JSON.stringify(event));
  }
}

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
  scene: GameScene
};

const game = new Phaser.Game(config);
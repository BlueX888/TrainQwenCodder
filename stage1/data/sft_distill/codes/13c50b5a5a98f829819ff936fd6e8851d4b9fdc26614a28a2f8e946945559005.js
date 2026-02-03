// 可验证信号对象
window.__signals__ = {
  score: 0,
  gameState: 'playing', // 'playing', 'won', 'lost'
  itemsCollected: 0,
  totalItems: 8,
  playerPosition: { x: 0, y: 0 },
  aiPosition: { x: 0, y: 0 },
  events: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.ai = null;
    this.items = null;
    this.cursors = null;
    this.scoreText = null;
    this.statusText = null;
    this.gameOver = false;
    this.itemsCollected = 0;
    this.totalItems = 8;
    this.aiSpeed = 80;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();

    // 创建玩家（蓝色方块）
    this.player = this.physics.add.sprite(100, 100, 'playerTex');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(30, 30);

    // 创建 AI（绿色方块）
    this.ai = this.physics.add.sprite(700, 500, 'aiTex');
    this.ai.setCollideWorldBounds(true);
    this.ai.body.setSize(30, 30);

    // 创建物品组（黄色圆形）
    this.items = this.physics.add.group();
    this.createItems();

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitAI, null, this);

    // UI 文本
    this.scoreText = this.add.text(16, 16, `物品: 0/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setVisible(false);

    // 初始化信号
    this.updateSignals();
    window.__signals__.events.push({ time: 0, event: 'game_start' });
  }

  createTextures() {
    // 玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('playerTex', 32, 32);
    playerGraphics.destroy();

    // AI 纹理（绿色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x00ff00, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('aiTex', 32, 32);
    aiGraphics.destroy();

    // 物品纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('itemTex', 24, 24);
    itemGraphics.destroy();
  }

  createItems() {
    // 使用固定种子生成物品位置（确保确定性）
    const positions = [
      { x: 200, y: 150 },
      { x: 400, y: 100 },
      { x: 600, y: 200 },
      { x: 300, y: 350 },
      { x: 500, y: 400 },
      { x: 150, y: 450 },
      { x: 650, y: 450 },
      { x: 400, y: 500 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'itemTex');
      item.body.setCircle(12);
      item.body.setAllowGravity(false);
      item.body.setImmovable(true);
    });
  }

  collectItem(player, item) {
    if (this.gameOver) return;

    item.destroy();
    this.itemsCollected++;
    this.scoreText.setText(`物品: ${this.itemsCollected}/${this.totalItems}`);

    // 更新信号
    window.__signals__.itemsCollected = this.itemsCollected;
    window.__signals__.score = this.itemsCollected * 100;
    window.__signals__.events.push({
      time: this.time.now,
      event: 'item_collected',
      itemsRemaining: this.totalItems - this.itemsCollected
    });

    // 检查胜利条件
    if (this.itemsCollected >= this.totalItems) {
      this.winGame();
    }
  }

  hitAI(player, ai) {
    if (this.gameOver) return;
    this.loseGame();
  }

  winGame() {
    this.gameOver = true;
    this.physics.pause();
    this.statusText.setText('胜利！').setVisible(true).setStyle({ fill: '#00ff00' });

    window.__signals__.gameState = 'won';
    window.__signals__.events.push({
      time: this.time.now,
      event: 'game_won',
      finalScore: this.itemsCollected * 100
    });

    console.log('GAME WON:', JSON.stringify(window.__signals__));
  }

  loseGame() {
    this.gameOver = true;
    this.physics.pause();
    this.statusText.setText('失败！').setVisible(true).setStyle({ fill: '#ff0000' });

    window.__signals__.gameState = 'lost';
    window.__signals__.events.push({
      time: this.time.now,
      event: 'game_lost',
      itemsCollected: this.itemsCollected
    });

    console.log('GAME LOST:', JSON.stringify(window.__signals__));
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 玩家移动控制
    const playerSpeed = 160;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // AI 追踪玩家
    this.physics.moveToObject(this.ai, this.player, this.aiSpeed);

    // 更新信号
    this.updateSignals();
  }

  updateSignals() {
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
    window.__signals__.aiPosition = {
      x: Math.round(this.ai.x),
      y: Math.round(this.ai.y)
    };
    window.__signals__.score = this.itemsCollected * 100;
  }
}

// 游戏配置
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

// 启动游戏
const game = new Phaser.Game(config);
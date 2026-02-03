class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.targetScore = 10;
  }

  preload() {
    // 使用 Graphics 创建纹理，不依赖外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建AI纹理（灰色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x808080, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 创建物品纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建AI（从远离玩家的位置开始）
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 使用固定种子生成物品位置（确保可重现性）
    const seed = 12345;
    const random = this.createSeededRandom(seed);
    
    for (let i = 0; i < this.targetScore; i++) {
      const x = random() * 700 + 50; // 50-750
      const y = random() * 500 + 50; // 50-550
      const item = this.items.create(x, y, 'item');
      item.setCircle(12);
    }

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(
      this.player,
      this.items,
      this.collectItem,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.ai,
      this.hitAI,
      null,
      this
    );

    // UI文本
    this.scoreText = this.add.text(16, 16, `收集: 0/${this.targetScore}`, {
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
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);

    // 边界
    this.physics.world.setBounds(0, 0, 800, 600);
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) {
      return;
    }

    // 玩家移动
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // AI追踪玩家
    const aiSpeed = 120;
    this.physics.moveToObject(this.ai, this.player, aiSpeed);
  }

  collectItem(player, item) {
    item.destroy();
    this.score++;
    this.scoreText.setText(`收集: ${this.score}/${this.targetScore}`);

    if (this.score >= this.targetScore) {
      this.winGame();
    }
  }

  hitAI(player, ai) {
    if (!this.gameOver) {
      this.loseGame();
    }
  }

  winGame() {
    this.gameWon = true;
    this.player.setVelocity(0);
    this.ai.setVelocity(0);
    
    this.statusText.setText('胜利！');
    this.statusText.setStyle({ fill: '#00ff00' });
    this.statusText.setVisible(true);

    console.log('Game Won! Score:', this.score);
  }

  loseGame() {
    this.gameOver = true;
    this.player.setVelocity(0);
    this.ai.setVelocity(0);
    
    this.statusText.setText('失败！');
    this.statusText.setStyle({ fill: '#ff0000' });
    this.statusText.setVisible(true);

    console.log('Game Over! Score:', this.score);
  }

  // 创建可重现的随机数生成器
  createSeededRandom(seed) {
    let state = seed;
    return function() {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
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
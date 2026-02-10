class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
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

    // 创建物品纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(32, 32);

    // 创建AI
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);
    this.ai.body.setSize(32, 32);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 使用固定种子生成20个物品
    const seed = 12345;
    let rng = this.seededRandom(seed);
    
    for (let i = 0; i < 20; i++) {
      const x = 50 + rng() * 700;
      const y = 50 + rng() * 500;
      const item = this.items.create(x, y, 'item');
      item.body.setSize(24, 24);
      item.setImmovable(true);
    }

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitAI, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示分数
    this.scoreText = this.add.text(16, 16, 'Score: 0/20', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 状态文本
    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);
  }

  // 简单的伪随机数生成器（保证确定性）
  seededRandom(seed) {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }

  collectItem(player, item) {
    if (this.gameOver || this.gameWon) return;

    item.destroy();
    this.score++;
    this.scoreText.setText('Score: ' + this.score + '/20');

    // 检查是否获胜
    if (this.score >= 20) {
      this.gameWon = true;
      this.statusText.setText('YOU WIN!');
      this.statusText.setVisible(true);
      this.physics.pause();
    }
  }

  hitAI(player, ai) {
    if (this.gameOver || this.gameWon) return;

    this.gameOver = true;
    this.statusText.setText('GAME OVER!\nCaught by AI');
    this.statusText.setVisible(true);
    this.physics.pause();
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) {
      return;
    }

    // 玩家控制
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

    // 归一化对角线速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }

    // AI追踪玩家，速度为120
    this.physics.moveToObject(this.ai, this.player, 120);
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
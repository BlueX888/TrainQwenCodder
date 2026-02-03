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

    // 创建 AI 纹理（灰色方块）
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

    // 创建 AI
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 使用固定种子生成物品位置（确保可重现）
    const seed = 12345;
    let random = this.seededRandom(seed);
    
    for (let i = 0; i < 10; i++) {
      const x = 50 + random() * 700;
      const y = 50 + random() * 500;
      const item = this.items.create(x, y, 'item');
      item.setCircle(12); // 设置圆形碰撞体
    }

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 设置碰撞检测
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

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 10', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 创建结果文本（初始隐藏）
    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    this.resultText.setOrigin(0.5);
    this.resultText.setVisible(false);
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) {
      // 游戏结束，停止所有移动
      this.player.setVelocity(0);
      this.ai.setVelocity(0);
      return;
    }

    // 玩家移动控制
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

    // AI 追踪玩家
    this.physics.moveToObject(this.ai, this.player, 120);
  }

  collectItem(player, item) {
    // 移除物品
    item.destroy();

    // 增加分数
    this.score++;
    this.scoreText.setText('Score: ' + this.score + ' / 10');

    // 检查胜利条件
    if (this.score >= 10) {
      this.gameWon = true;
      this.resultText.setText('YOU WIN!');
      this.resultText.setFill('#00ff00');
      this.resultText.setVisible(true);
    }
  }

  hitAI(player, ai) {
    if (!this.gameOver) {
      this.gameOver = true;
      this.resultText.setText('GAME OVER!\nAI Caught You!');
      this.resultText.setFill('#ff0000');
      this.resultText.setVisible(true);
    }
  }

  // 简单的伪随机数生成器（基于种子）
  seededRandom(seed) {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }
}

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

const game = new Phaser.Game(config);
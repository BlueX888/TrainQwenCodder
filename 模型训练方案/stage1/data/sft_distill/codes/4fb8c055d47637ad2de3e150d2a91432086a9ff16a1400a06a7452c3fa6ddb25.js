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
    const { width, height } = this.cameras.main;

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
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建AI敌人
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 使用固定种子生成物品位置（确保确定性）
    const seed = 12345;
    const random = new Phaser.Math.RandomDataGenerator([seed]);
    
    for (let i = 0; i < 10; i++) {
      const x = random.between(50, width - 50);
      const y = random.between(50, height - 50);
      const item = this.items.create(x, y, 'item');
      item.setCircle(12); // 设置圆形碰撞体
    }

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitAI, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, 'Score: 0/10', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.resultText = this.add.text(width / 2, height / 2, '', {
      fontSize: '48px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.resultText.setOrigin(0.5);
    this.resultText.setVisible(false);

    // 添加提示文本
    this.add.text(16, height - 40, 'Use Arrow Keys or WASD to move', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) {
      return;
    }

    // 玩家移动控制
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // AI追踪逻辑
    const angle = Phaser.Math.Angle.Between(
      this.ai.x,
      this.ai.y,
      this.player.x,
      this.player.y
    );

    const aiSpeed = 120;
    this.physics.velocityFromRotation(angle, aiSpeed, this.ai.body.velocity);
  }

  collectItem(player, item) {
    item.destroy();
    this.score++;
    this.scoreText.setText(`Score: ${this.score}/10`);

    if (this.score >= 10) {
      this.winGame();
    }
  }

  hitAI(player, ai) {
    if (!this.gameOver && !this.gameWon) {
      this.loseGame();
    }
  }

  winGame() {
    this.gameWon = true;
    this.player.setVelocity(0);
    this.ai.setVelocity(0);
    this.resultText.setText('YOU WIN!');
    this.resultText.setStyle({ fill: '#00ff00' });
    this.resultText.setVisible(true);
  }

  loseGame() {
    this.gameOver = true;
    this.player.setVelocity(0);
    this.ai.setVelocity(0);
    this.resultText.setText('GAME OVER!');
    this.resultText.setStyle({ fill: '#ff0000' });
    this.resultText.setVisible(true);
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

new Phaser.Game(config);
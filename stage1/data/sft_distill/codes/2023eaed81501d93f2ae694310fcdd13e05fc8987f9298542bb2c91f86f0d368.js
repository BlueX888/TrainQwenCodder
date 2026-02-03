class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.isVictory = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建 AI 纹理（绿色方块）
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

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建 AI 精灵
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建物品组（12 个物品）
    this.items = this.physics.add.group();
    
    // 使用固定种子生成物品位置（确保可重现）
    const seed = 12345;
    let rng = seed;
    const seededRandom = () => {
      rng = (rng * 9301 + 49297) % 233280;
      return rng / 233280;
    };

    for (let i = 0; i < 12; i++) {
      const x = 50 + seededRandom() * 700;
      const y = 50 + seededRandom() * 500;
      const item = this.items.create(x, y, 'item');
      item.setCircle(12);
    }

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitAI, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 12', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 游戏结果文本（初始隐藏）
    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.resultText.setOrigin(0.5);
    this.resultText.setVisible(false);

    // 提示文本
    this.add.text(16, 50, 'Use Arrow Keys to Move\nCollect 12 items to win!\nAvoid the green AI!', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制
    const speed = 160;
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

    // AI 追踪玩家逻辑
    const angle = Phaser.Math.Angle.Between(
      this.ai.x,
      this.ai.y,
      this.player.x,
      this.player.y
    );

    // 设置 AI 速度为 80，朝向玩家
    this.physics.velocityFromRotation(angle, 80, this.ai.body.velocity);
  }

  collectItem(player, item) {
    item.destroy();
    this.score++;
    this.scoreText.setText('Score: ' + this.score + ' / 12');

    // 检查是否获胜
    if (this.score >= 12) {
      this.winGame();
    }
  }

  hitAI(player, ai) {
    this.loseGame();
  }

  winGame() {
    this.gameOver = true;
    this.isVictory = true;
    this.physics.pause();
    
    this.resultText.setText('VICTORY!\nYou collected all items!');
    this.resultText.setFill('#00ff00');
    this.resultText.setVisible(true);

    console.log('Game Result: VICTORY - Score:', this.score);
  }

  loseGame() {
    this.gameOver = true;
    this.isVictory = false;
    this.physics.pause();
    
    this.resultText.setText('GAME OVER!\nCaught by AI!');
    this.resultText.setFill('#ff0000');
    this.resultText.setVisible(true);

    console.log('Game Result: DEFEAT - Score:', this.score);
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
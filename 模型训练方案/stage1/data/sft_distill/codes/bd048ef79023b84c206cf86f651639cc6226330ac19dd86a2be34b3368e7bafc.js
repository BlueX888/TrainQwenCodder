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
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建 AI 纹理（紫色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x9900ff, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 创建物品纹理（黄色圆点）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(8, 8, 8);
    itemGraphics.generateTexture('item', 16, 16);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建 AI
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 使用固定种子生成物品位置（确保确定性）
    const seed = 12345;
    let random = seed;
    const seededRandom = () => {
      random = (random * 9301 + 49297) % 233280;
      return random / 233280;
    };

    for (let i = 0; i < 15; i++) {
      const x = 50 + seededRandom() * 700;
      const y = 50 + seededRandom() * 500;
      const item = this.items.create(x, y, 'item');
      item.setCollideWorldBounds(true);
    }

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitAI, null, this);

    // 创建 UI 文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 15', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });
    this.resultText.setOrigin(0.5);
    this.resultText.setVisible(false);

    // 添加边界
    this.add.graphics()
      .lineStyle(2, 0xffffff, 1)
      .strokeRect(0, 0, 800, 600);
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) {
      return;
    }

    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    }

    // AI 追踪玩家（速度 160）
    this.physics.moveToObject(this.ai, this.player, 160);
  }

  collectItem(player, item) {
    item.destroy();
    this.score++;
    this.scoreText.setText('Score: ' + this.score + ' / 15');

    // 检查是否获胜
    if (this.score >= 15) {
      this.gameWon = true;
      this.endGame('YOU WIN!', 0x00ff00);
    }
  }

  hitAI(player, ai) {
    if (!this.gameOver) {
      this.gameOver = true;
      this.endGame('GAME OVER!', 0xff0000);
    }
  }

  endGame(message, color) {
    // 停止所有移动
    this.player.setVelocity(0);
    this.ai.setVelocity(0);

    // 显示结果
    this.resultText.setText(message);
    this.resultText.setColor('#' + color.toString(16).padStart(6, '0'));
    this.resultText.setVisible(true);

    // 添加重启提示
    const restartText = this.add.text(400, 360, 'Press SPACE to restart', {
      fontSize: '20px',
      fill: '#ffffff'
    });
    restartText.setOrigin(0.5);

    // 监听空格键重启
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
    });
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
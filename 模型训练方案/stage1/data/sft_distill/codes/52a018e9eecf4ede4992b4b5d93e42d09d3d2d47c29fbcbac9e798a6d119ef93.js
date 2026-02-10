class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.seed = 12345; // 固定随机种子
  }

  // 使用固定种子的随机数生成器
  seededRandom() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建AI纹理（红色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0xff0000, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 创建收集物纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建AI（从左上角开始）
    this.ai = this.physics.add.sprite(50, 50, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建收集物品组
    this.items = this.physics.add.group();
    
    // 随机生成8个物品（使用固定种子确保确定性）
    for (let i = 0; i < 8; i++) {
      const x = 100 + this.seededRandom() * (width - 200);
      const y = 100 + this.seededRandom() * (height - 200);
      const item = this.items.create(x, y, 'item');
      item.setCollideWorldBounds(true);
    }

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitAI, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0/8', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 游戏状态文本（初始隐藏）
    this.statusText = this.add.text(width / 2, height / 2, '', {
      fontSize: '48px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);

    // 提示文本
    this.add.text(16, height - 40, 'Use Arrow Keys or WASD to move', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  collectItem(player, item) {
    if (this.gameOver || this.gameWon) return;

    item.destroy();
    this.score++;
    this.scoreText.setText(`Score: ${this.score}/8`);

    // 检查是否获胜
    if (this.score >= 8) {
      this.gameWon = true;
      this.endGame('YOU WIN!', '#00ff00');
    }
  }

  hitAI(player, ai) {
    if (this.gameOver || this.gameWon) return;

    this.gameOver = true;
    this.endGame('GAME OVER!', '#ff0000');
  }

  endGame(message, color) {
    // 停止所有物理对象
    this.player.setVelocity(0, 0);
    this.ai.setVelocity(0, 0);
    this.physics.pause();

    // 显示结束信息
    this.statusText.setText(message);
    this.statusText.setStyle({ fill: color });
    this.statusText.setVisible(true);

    // 添加重启提示
    const restartText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 60,
      'Click to Restart',
      {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
    restartText.setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
      this.score = 0;
      this.gameOver = false;
      this.gameWon = false;
      this.seed = 12345; // 重置种子
    });
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) return;

    // 玩家移动控制
    const speed = 200;
    this.player.setVelocity(0, 0);

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

    // AI追踪玩家（速度80）
    this.physics.moveToObject(this.ai, this.player, 80);
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
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.seed = 12345; // 固定随机种子，保证确定性
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 初始化随机数生成器（固定种子）
    Phaser.Math.RND.sow([this.seed]);

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

    // 创建物品纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建AI角色
    this.ai = this.physics.add.sprite(700, 500, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建物品组（8个物品）
    this.items = this.physics.add.group();
    const positions = [
      { x: 200, y: 150 },
      { x: 400, y: 100 },
      { x: 600, y: 150 },
      { x: 150, y: 300 },
      { x: 650, y: 300 },
      { x: 200, y: 450 },
      { x: 400, y: 500 },
      { x: 600, y: 450 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setImmovable(true);
    });

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测：玩家收集物品
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 添加碰撞检测：AI碰到玩家
    this.physics.add.overlap(this.player, this.ai, this.hitByAI, null, this);

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 8', {
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

    // 添加说明文本
    this.add.text(16, 50, 'Use Arrow Keys to Move\nCollect 8 items to win!\nAvoid the Red AI!', {
      fontSize: '16px',
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

    // AI追踪玩家逻辑
    const aiSpeed = 80;
    this.physics.moveToObject(this.ai, this.player, aiSpeed);

    // 计算AI与玩家的距离（用于调试或额外逻辑）
    const distance = Phaser.Math.Distance.Between(
      this.ai.x, this.ai.y,
      this.player.x, this.player.y
    );
  }

  collectItem(player, item) {
    // 收集物品
    item.destroy();
    this.score++;
    this.scoreText.setText(`Score: ${this.score} / 8`);

    // 检查是否获胜
    if (this.score >= 8) {
      this.gameWon = true;
      this.endGame('YOU WIN!', '#00ff00');
    }
  }

  hitByAI(player, ai) {
    // 被AI碰到，游戏失败
    if (!this.gameOver && !this.gameWon) {
      this.gameOver = true;
      this.endGame('GAME OVER!', '#ff0000');
    }
  }

  endGame(message, color) {
    // 停止所有物理对象
    this.player.setVelocity(0);
    this.ai.setVelocity(0);
    this.physics.pause();

    // 显示结束信息
    this.statusText.setText(message);
    this.statusText.setStyle({ fill: color });
    this.statusText.setVisible(true);

    // 添加重启提示
    const restartText = this.add.text(400, 360, 'Press SPACE to Restart', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    restartText.setOrigin(0.5);

    // 监听空格键重启
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
      this.score = 0;
      this.gameOver = false;
      this.gameWon = false;
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

const game = new Phaser.Game(config);
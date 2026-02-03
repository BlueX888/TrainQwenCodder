class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.won = false;
    this.targetScore = 5;
    this.aiSpeed = 360;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成 AI 纹理（灰色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x808080, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 生成物品纹理（黄色圆形）
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
    this.createItems();

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitAI, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // UI 文本
    this.scoreText = this.add.text(16, 16, 'Items: 0/5', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 添加边界线
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(0, 0, 800, 600);
  }

  createItems() {
    // 使用固定种子生成物品位置（确保可重现）
    const positions = [
      { x: 200, y: 150 },
      { x: 600, y: 150 },
      { x: 400, y: 450 },
      { x: 150, y: 450 },
      { x: 650, y: 450 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setCircle(12);
      item.body.setOffset(0, 0);
    });
  }

  collectItem(player, item) {
    if (this.gameOver) return;

    item.destroy();
    this.score++;
    this.scoreText.setText(`Items: ${this.score}/${this.targetScore}`);

    // 检查胜利条件
    if (this.score >= this.targetScore) {
      this.won = true;
      this.endGame('YOU WIN!');
    }
  }

  hitAI(player, ai) {
    if (this.gameOver) return;

    this.won = false;
    this.endGame('GAME OVER!');
  }

  endGame(message) {
    this.gameOver = true;
    this.player.setVelocity(0, 0);
    this.ai.setVelocity(0, 0);
    
    this.gameOverText.setText(message);
    this.gameOverText.setVisible(true);

    // 输出可验证状态
    console.log('Game Over:', {
      score: this.score,
      won: this.won,
      gameOver: this.gameOver
    });
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 玩家移动控制
    const speed = 200;
    this.player.setVelocity(0, 0);

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

    // 对角线移动时速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }

    // AI 追踪玩家
    this.physics.moveToObject(this.ai, this.player, this.aiSpeed);
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
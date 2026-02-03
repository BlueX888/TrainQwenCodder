class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成 AI 纹理（白色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0xffffff, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 生成物品纹理（黄色圆点）
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
    this.createItems();

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitByAI, null, this);

    // 显示分数
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 20', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 游戏状态文本
    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);
  }

  createItems() {
    // 使用固定种子生成物品位置
    const rng = this.createSeededRandom(this.seed);
    
    for (let i = 0; i < 20; i++) {
      const x = rng() * 700 + 50; // 50-750
      const y = rng() * 500 + 50; // 50-550
      const item = this.items.create(x, y, 'item');
      item.setCircle(8);
    }
  }

  // 简单的伪随机数生成器（固定种子）
  createSeededRandom(seed) {
    let current = seed;
    return function() {
      current = (current * 9301 + 49297) % 233280;
      return current / 233280;
    };
  }

  collectItem(player, item) {
    if (this.gameOver) return;

    item.destroy();
    this.score++;
    this.scoreText.setText(`Score: ${this.score} / 20`);

    // 检查是否获胜
    if (this.score >= 20) {
      this.gameWon = true;
      this.gameOver = true;
      this.showGameOver('YOU WIN!', 0x00ff00);
    }
  }

  hitByAI(player, ai) {
    if (this.gameOver) return;

    this.gameOver = true;
    this.showGameOver('GAME OVER!', 0xff0000);
  }

  showGameOver(message, color) {
    this.player.setVelocity(0, 0);
    this.ai.setVelocity(0, 0);
    
    this.statusText.setText(message);
    this.statusText.setStyle({ fill: `#${color.toString(16).padStart(6, '0')}` });
    this.statusText.setVisible(true);

    // 3 秒后重启游戏
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 玩家控制
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

    // 对角线移动速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }

    // AI 追踪玩家
    this.updateAI();
  }

  updateAI() {
    const aiSpeed = 300;
    
    // 计算玩家和 AI 之间的距离和角度
    const dx = this.player.x - this.ai.x;
    const dy = this.player.y - this.ai.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      // 归一化方向向量并应用速度
      const vx = (dx / distance) * aiSpeed;
      const vy = (dy / distance) * aiSpeed;
      this.ai.setVelocity(vx, vy);
    }
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
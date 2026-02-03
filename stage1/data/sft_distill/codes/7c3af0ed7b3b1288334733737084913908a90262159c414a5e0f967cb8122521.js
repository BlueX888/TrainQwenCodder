class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 创建纹理用于游戏对象
    this.createTextures();
  }

  createTextures() {
    // 玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // AI纹理（绿色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x00ff00, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 收集物品纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(8, 8, 8);
    itemGraphics.generateTexture('item', 16, 16);
    itemGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建AI敌人
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建收集物品组
    this.items = this.physics.add.group();
    this.createItems();

    // 设置键盘控制
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

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 20', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(100);

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setDepth(100);
    this.statusText.setVisible(false);

    // 添加游戏边界提示
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(2, 2, 796, 596);
  }

  createItems() {
    // 使用固定种子确保可重现性
    const positions = [];
    const seed = 12345;
    let random = this.seededRandom(seed);

    // 生成20个不重叠的位置
    for (let i = 0; i < 20; i++) {
      let x, y;
      let attempts = 0;
      const maxAttempts = 100;

      do {
        x = 50 + random() * 700;
        y = 50 + random() * 500;
        attempts++;

        // 检查是否与玩家和AI初始位置太近
        const tooCloseToPlayer = Phaser.Math.Distance.Between(x, y, 400, 300) < 80;
        const tooCloseToAI = Phaser.Math.Distance.Between(x, y, 100, 100) < 80;

        // 检查是否与其他物品太近
        let tooCloseToOthers = false;
        for (const pos of positions) {
          if (Phaser.Math.Distance.Between(x, y, pos.x, pos.y) < 40) {
            tooCloseToOthers = true;
            break;
          }
        }

        if (!tooCloseToPlayer && !tooCloseToAI && !tooCloseToOthers) {
          break;
        }
      } while (attempts < maxAttempts);

      positions.push({ x, y });
      const item = this.items.create(x, y, 'item');
      item.setCircle(8);
    }
  }

  // 简单的种子随机数生成器
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
    this.scoreText.setText(`Score: ${this.score} / 20`);

    // 检查是否获胜
    if (this.score >= 20) {
      this.gameWon = true;
      this.endGame('YOU WIN!', 0x00ff00);
    }
  }

  hitAI(player, ai) {
    if (this.gameOver || this.gameWon) return;

    this.gameOver = true;
    this.endGame('GAME OVER!', 0xff0000);
  }

  endGame(message, color) {
    // 停止所有移动
    this.player.setVelocity(0, 0);
    this.ai.setVelocity(0, 0);

    // 显示结束信息
    this.statusText.setText(message);
    this.statusText.setStyle({ fill: `#${color.toString(16).padStart(6, '0')}` });
    this.statusText.setVisible(true);

    // 添加重启提示
    this.time.delayedCall(1000, () => {
      const restartText = this.add.text(400, 360, 'Press SPACE to Restart', {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      });
      restartText.setOrigin(0.5);
      restartText.setDepth(100);

      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.restart();
      });
    });
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) return;

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

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }

    // AI追踪玩家（速度360）
    this.physics.moveToObject(this.ai, this.player, 360);
  }
}

// 游戏配置
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

// 启动游戏
const game = new Phaser.Game(config);
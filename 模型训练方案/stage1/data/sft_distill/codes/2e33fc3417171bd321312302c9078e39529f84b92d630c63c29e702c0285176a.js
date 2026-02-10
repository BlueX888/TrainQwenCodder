class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerX = 0;
    this.playerY = 0;
    this.crossCount = 0; // 穿越边界次数（状态信号）
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建红色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('playerTexture', 32, 32);
    graphics.destroy();

    // 创建玩家精灵（带物理系统）
    this.player = this.physics.add.sprite(400, 300, 'playerTexture');
    this.player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许穿越

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);

    // 键盘控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-120);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(120);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-120);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(120);
    }

    // 对角线移动时标准化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      const normalized = this.player.body.velocity.normalize().scale(120);
      this.player.setVelocity(normalized.x, normalized.y);
    }

    // 边界循环检测
    const halfWidth = this.player.width / 2;
    const halfHeight = this.player.height / 2;

    // 左边界 → 右边界
    if (this.player.x + halfWidth < 0) {
      this.player.x = this.cameras.main.width + halfWidth;
      this.crossCount++;
    }
    // 右边界 → 左边界
    else if (this.player.x - halfWidth > this.cameras.main.width) {
      this.player.x = -halfWidth;
      this.crossCount++;
    }

    // 上边界 → 下边界
    if (this.player.y + halfHeight < 0) {
      this.player.y = this.cameras.main.height + halfHeight;
      this.crossCount++;
    }
    // 下边界 → 上边界
    else if (this.player.y - halfHeight > this.cameras.main.height) {
      this.player.y = -halfHeight;
      this.crossCount++;
    }

    // 更新状态
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `Position: (${this.playerX}, ${this.playerY})`,
      `Speed: 120`,
      `Cross Count: ${this.crossCount}`,
      `Use Arrow Keys to Move`
    ]);
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
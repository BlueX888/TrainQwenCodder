class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.wrapCount = 0; // 状态信号：记录传送次数
    this.playerX = 0;
    this.playerY = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建绿色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵（屏幕中央）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 允许移出边界

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界线作为视觉参考
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(2, 0xffffff, 0.5);
    borderGraphics.strokeRect(0, 0, 800, 600);

    this.updateStatus();
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);

    // 处理输入
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-80);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(80);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-80);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(80);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      const normalized = this.player.body.velocity.normalize().scale(80);
      this.player.setVelocity(normalized.x, normalized.y);
    }

    // 边界循环传送效果
    const halfWidth = this.player.width / 2;
    const halfHeight = this.player.height / 2;

    // 左右边界
    if (this.player.x < -halfWidth) {
      this.player.x = 800 + halfWidth;
      this.wrapCount++;
    } else if (this.player.x > 800 + halfWidth) {
      this.player.x = -halfWidth;
      this.wrapCount++;
    }

    // 上下边界
    if (this.player.y < -halfHeight) {
      this.player.y = 600 + halfHeight;
      this.wrapCount++;
    } else if (this.player.y > 600 + halfHeight) {
      this.player.y = -halfHeight;
      this.wrapCount++;
    }

    // 更新状态
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);
    this.updateStatus();
  }

  updateStatus() {
    this.statusText.setText([
      `Position: (${this.playerX}, ${this.playerY})`,
      `Wrap Count: ${this.wrapCount}`,
      `Speed: 80`,
      '',
      'Controls: Arrow Keys or WASD'
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
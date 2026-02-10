class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.crossBoundaryCount = 0; // 穿越边界次数（状态信号）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建青色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00FFFF, 1); // 青色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('playerTexture', 32, 32);
    graphics.destroy();

    // 创建玩家精灵并启用物理
    this.player = this.physics.add.sprite(400, 300, 'playerTexture');
    this.player.setCollideWorldBounds(false); // 关闭世界边界碰撞，允许穿越

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建状态文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 更新状态显示
    this.updateStatusText();
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);

    // 键盘控制移动
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

    // 处理对角线移动时的速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      const normalizedSpeed = 120 / Math.sqrt(2);
      this.player.setVelocity(
        this.player.body.velocity.x > 0 ? normalizedSpeed : -normalizedSpeed,
        this.player.body.velocity.y > 0 ? normalizedSpeed : -normalizedSpeed
      );
    }

    // 边界循环检测
    const halfWidth = this.player.width / 2;
    const halfHeight = this.player.height / 2;

    // 左右边界循环
    if (this.player.x < -halfWidth) {
      this.player.x = this.cameras.main.width + halfWidth;
      this.crossBoundaryCount++;
    } else if (this.player.x > this.cameras.main.width + halfWidth) {
      this.player.x = -halfWidth;
      this.crossBoundaryCount++;
    }

    // 上下边界循环
    if (this.player.y < -halfHeight) {
      this.player.y = this.cameras.main.height + halfHeight;
      this.crossBoundaryCount++;
    } else if (this.player.y > this.cameras.main.height + halfHeight) {
      this.player.y = -halfHeight;
      this.crossBoundaryCount++;
    }

    // 更新状态显示
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Boundary Crosses: ${this.crossBoundaryCount}`,
      `Speed: 120`,
      '',
      'Use Arrow Keys to Move'
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

// 启动游戏
new Phaser.Game(config);
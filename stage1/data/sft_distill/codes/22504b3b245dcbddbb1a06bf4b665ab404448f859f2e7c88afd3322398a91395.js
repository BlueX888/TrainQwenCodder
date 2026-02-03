class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.crossBoundaryCount = 0; // 状态信号：记录穿越边界次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建橙色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8C00, 1); // 橙色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('playerTexture', 32, 32);
    graphics.destroy();

    // 创建玩家精灵（物理对象）
    this.player = this.physics.add.sprite(400, 300, 'playerTexture');
    this.player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许移出

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加 WASD 控制
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 绘制边界提示
    const border = this.add.graphics();
    border.lineStyle(2, 0xFFFFFF, 0.5);
    border.strokeRect(0, 0, 800, 600);

    this.updateStatusText();
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);

    // 处理键盘输入
    const speed = 300;

    if (this.cursors.left.isDown || this.keys.a.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.keys.d.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.keys.w.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.keys.s.isDown) {
      this.player.setVelocityY(speed);
    }

    // 处理对角线移动时的速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }

    // 循环地图效果：检测边界并从对侧出现
    const halfWidth = this.player.width / 2;
    const halfHeight = this.player.height / 2;

    // 左右边界
    if (this.player.x < -halfWidth) {
      this.player.x = this.cameras.main.width + halfWidth;
      this.crossBoundaryCount++;
      this.updateStatusText();
    } else if (this.player.x > this.cameras.main.width + halfWidth) {
      this.player.x = -halfWidth;
      this.crossBoundaryCount++;
      this.updateStatusText();
    }

    // 上下边界
    if (this.player.y < -halfHeight) {
      this.player.y = this.cameras.main.height + halfHeight;
      this.crossBoundaryCount++;
      this.updateStatusText();
    } else if (this.player.y > this.cameras.main.height + halfHeight) {
      this.player.y = -halfHeight;
      this.crossBoundaryCount++;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText([
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Boundary Crosses: ${this.crossBoundaryCount}`,
      `Speed: 300`,
      '',
      'Controls: Arrow Keys or WASD'
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);
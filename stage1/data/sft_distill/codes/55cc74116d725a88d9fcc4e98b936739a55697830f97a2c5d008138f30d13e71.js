class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerX = 0;
    this.playerY = 0;
    this.crossedBoundaryCount = 0; // 状态信号：穿越边界次数
  }

  preload() {
    // 使用 Graphics 创建绿色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 不与世界边界碰撞
    
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
    this.statusText.setDepth(100);

    // 添加边界线用于视觉参考
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 0.5);
    graphics.strokeRect(0, 0, 800, 600);
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);

    // 处理键盘输入
    const speed = 360;
    
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

    // 处理对角线移动时的速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      const normalized = this.player.body.velocity.normalize();
      this.player.setVelocity(normalized.x * speed, normalized.y * speed);
    }

    // 循环地图效果 - 边界检测与传送
    const halfWidth = this.player.width / 2;
    const halfHeight = this.player.height / 2;

    // 左右边界
    if (this.player.x < -halfWidth) {
      this.player.x = 800 + halfWidth;
      this.crossedBoundaryCount++;
    } else if (this.player.x > 800 + halfWidth) {
      this.player.x = -halfWidth;
      this.crossedBoundaryCount++;
    }

    // 上下边界
    if (this.player.y < -halfHeight) {
      this.player.y = 600 + halfHeight;
      this.crossedBoundaryCount++;
    } else if (this.player.y > 600 + halfHeight) {
      this.player.y = -halfHeight;
      this.crossedBoundaryCount++;
    }

    // 更新状态信号
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);

    // 更新状态显示
    this.statusText.setText([
      `Position: (${this.playerX}, ${this.playerY})`,
      `Speed: ${speed}`,
      `Boundary Crosses: ${this.crossedBoundaryCount}`,
      `Velocity: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`,
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

const game = new Phaser.Game(config);
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.crossBoundaryCount = 0; // 穿越边界计数器（状态信号）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建青色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('playerTex', 32, 32);
    graphics.destroy();

    // 创建物理精灵玩家
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
    this.player.setCollideWorldBounds(false); // 允许移出边界
    this.player.setMaxVelocity(300, 300); // 设置最大速度为300

    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
    this.updateStatusText();

    // 添加说明文字
    this.add.text(10, 40, 'Use Arrow Keys to Move\nSpeed: 300\nCross boundary to wrap around', {
      fontSize: '14px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);

    // 处理方向键输入
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    }

    // 处理边界循环（wrap around）
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;
    let wrapped = false;

    // 左右边界
    if (this.player.x < -playerWidth / 2) {
      this.player.x = this.cameras.main.width + playerWidth / 2;
      wrapped = true;
    } else if (this.player.x > this.cameras.main.width + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      wrapped = true;
    }

    // 上下边界
    if (this.player.y < -playerHeight / 2) {
      this.player.y = this.cameras.main.height + playerHeight / 2;
      wrapped = true;
    } else if (this.player.y > this.cameras.main.height + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      wrapped = true;
    }

    // 如果穿越了边界，增加计数
    if (wrapped) {
      this.crossBoundaryCount++;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Boundary Crosses: ${this.crossBoundaryCount}\n` +
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    );
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
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);
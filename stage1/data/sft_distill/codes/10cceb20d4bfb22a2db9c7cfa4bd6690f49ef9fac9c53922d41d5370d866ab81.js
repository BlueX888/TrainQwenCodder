class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.crossCount = 0; // 穿越边界次数（状态信号）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建灰色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('playerTexture', 40, 40);
    graphics.destroy();

    // 创建玩家精灵（居中位置）
    this.player = this.physics.add.sprite(400, 300, 'playerTexture');
    this.player.setCollideWorldBounds(false); // 允许移出边界

    // 设置移动速度
    this.moveSpeed = 300;

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示穿越次数文本
    this.crossText = this.add.text(10, 10, 'Cross Count: 0', {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 显示控制提示
    this.add.text(10, 40, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      color: '#cccccc'
    });
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);

    // 键盘控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.moveSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.moveSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.moveSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.moveSpeed);
    }

    // 边界循环检测
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;

    // 左右边界循环
    if (this.player.x > this.cameras.main.width + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      this.crossCount++;
      this.updateCrossText();
    } else if (this.player.x < -playerWidth / 2) {
      this.player.x = this.cameras.main.width + playerWidth / 2;
      this.crossCount++;
      this.updateCrossText();
    }

    // 上下边界循环
    if (this.player.y > this.cameras.main.height + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      this.crossCount++;
      this.updateCrossText();
    } else if (this.player.y < -playerHeight / 2) {
      this.player.y = this.cameras.main.height + playerHeight / 2;
      this.crossCount++;
      this.updateCrossText();
    }
  }

  updateCrossText() {
    this.crossText.setText('Cross Count: ' + this.crossCount);
  }
}

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

new Phaser.Game(config);
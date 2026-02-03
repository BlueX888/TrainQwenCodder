class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerX = 0;
    this.playerY = 0;
    this.crossedBoundaryCount = 0; // 可验证状态：穿越边界次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 创建蓝色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1); // 蓝色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家物理精灵，初始位置在屏幕中央
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 关闭世界边界碰撞，允许移出边界

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加 WASD 键支持
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
    this.statusText.setDepth(1);
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);

    const speed = 200;

    // 处理键盘输入
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

    // 处理边界循环效果
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    // 左右边界检测
    if (this.player.x > gameWidth + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      this.crossedBoundaryCount++;
    } else if (this.player.x < -playerWidth / 2) {
      this.player.x = gameWidth + playerWidth / 2;
      this.crossedBoundaryCount++;
    }

    // 上下边界检测
    if (this.player.y > gameHeight + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      this.crossedBoundaryCount++;
    } else if (this.player.y < -playerHeight / 2) {
      this.player.y = gameHeight + playerHeight / 2;
      this.crossedBoundaryCount++;
    }

    // 更新可验证状态
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);

    // 更新状态显示
    this.statusText.setText([
      `Position: (${this.playerX}, ${this.playerY})`,
      `Speed: ${speed}`,
      `Boundary Crossed: ${this.crossedBoundaryCount}`,
      `Use Arrow Keys or WASD to move`
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
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);
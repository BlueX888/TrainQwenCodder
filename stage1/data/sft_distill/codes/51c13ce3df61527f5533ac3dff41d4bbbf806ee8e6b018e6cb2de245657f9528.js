class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.crossBoundaryCount = 0; // 状态信号：穿越边界次数
  }

  preload() {
    // 使用 Graphics 创建蓝色玩家纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建蓝色玩家精灵（居中位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 关闭世界边界碰撞，允许移出边界
    
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

    // 添加边界参考线（可选，用于调试）
    const debugGraphics = this.add.graphics();
    debugGraphics.lineStyle(2, 0xff0000, 0.3);
    debugGraphics.strokeRect(0, 0, 800, 600);

    this.updateStatusText();
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);

    // 键盘控制（支持 WASD 和方向键）
    const speed = 120;
    
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

    // 循环地图效果：检测边界并从对侧出现
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;
    const worldWidth = this.scale.width;
    const worldHeight = this.scale.height;

    let boundarycrossed = false;

    // 左右边界循环
    if (this.player.x > worldWidth + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      boundaryPressed = true;
    } else if (this.player.x < -playerWidth / 2) {
      this.player.x = worldWidth + playerWidth / 2;
      boundaryPressed = true;
    }

    // 上下边界循环
    if (this.player.y > worldHeight + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      boundaryPressed = true;
    } else if (this.player.y < -playerHeight / 2) {
      this.player.y = worldHeight + playerHeight / 2;
      boundaryPressed = true;
    }

    // 记录穿越边界次数
    if (boundaryPressed) {
      this.crossBoundaryCount++;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText([
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Boundary Crosses: ${this.crossBoundaryCount}`,
      `Speed: 120`,
      ``,
      `Controls: Arrow Keys or WASD`
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

const game = new Phaser.Game(config);
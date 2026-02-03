class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.cursors = null;
    this.moveSpeed = 80;
    // 可验证的状态信号
    this.crossCount = 0; // 穿越边界次数
    this.lastCrossDirection = null; // 最后穿越方向
  }

  preload() {
    // 使用 Graphics 创建灰色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('playerTex', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建玩家精灵（中心位置）
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
    this.player.setCollideWorldBounds(false); // 不与边界碰撞，允许移出
    
    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加 WASD 支持
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 初始化全局 signals
    window.__signals__ = {
      playerX: this.player.x,
      playerY: this.player.y,
      crossCount: this.crossCount,
      lastCrossDirection: this.lastCrossDirection,
      moveSpeed: this.moveSpeed
    };

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);

    // 处理键盘输入
    if (this.cursors.left.isDown || this.keys.A.isDown) {
      this.player.setVelocityX(-this.moveSpeed);
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      this.player.setVelocityX(this.moveSpeed);
    }

    if (this.cursors.up.isDown || this.keys.W.isDown) {
      this.player.setVelocityY(-this.moveSpeed);
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      this.player.setVelocityY(this.moveSpeed);
    }

    // 边界循环检测
    const halfWidth = this.player.width / 2;
    const halfHeight = this.player.height / 2;

    // 左边界穿越到右边
    if (this.player.x + halfWidth < 0) {
      this.player.x = this.cameras.main.width + halfWidth;
      this.crossCount++;
      this.lastCrossDirection = 'left-to-right';
      this.logCross('left-to-right');
    }
    // 右边界穿越到左边
    else if (this.player.x - halfWidth > this.cameras.main.width) {
      this.player.x = -halfWidth;
      this.crossCount++;
      this.lastCrossDirection = 'right-to-left';
      this.logCross('right-to-left');
    }

    // 上边界穿越到下边
    if (this.player.y + halfHeight < 0) {
      this.player.y = this.cameras.main.height + halfHeight;
      this.crossCount++;
      this.lastCrossDirection = 'top-to-bottom';
      this.logCross('top-to-bottom');
    }
    // 下边界穿越到上边
    else if (this.player.y - halfHeight > this.cameras.main.height) {
      this.player.y = -halfHeight;
      this.crossCount++;
      this.lastCrossDirection = 'bottom-to-top';
      this.logCross('bottom-to-top');
    }

    // 更新全局 signals
    window.__signals__ = {
      playerX: Math.round(this.player.x),
      playerY: Math.round(this.player.y),
      crossCount: this.crossCount,
      lastCrossDirection: this.lastCrossDirection,
      moveSpeed: this.moveSpeed,
      velocityX: Math.round(this.player.body.velocity.x),
      velocityY: Math.round(this.player.body.velocity.y)
    };

    // 更新调试文本
    this.debugText.setText([
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Velocity: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`,
      `Cross Count: ${this.crossCount}`,
      `Last Cross: ${this.lastCrossDirection || 'None'}`,
      `Speed: ${this.moveSpeed}`,
      '',
      'Controls: Arrow Keys or WASD'
    ]);
  }

  logCross(direction) {
    // 输出 JSON 格式日志
    console.log(JSON.stringify({
      event: 'boundary_cross',
      direction: direction,
      crossCount: this.crossCount,
      playerPosition: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y)
      },
      timestamp: Date.now()
    }));
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
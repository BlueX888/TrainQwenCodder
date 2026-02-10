class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 可验证的状态信号
    this.playerX = 0;
    this.playerY = 0;
    this.teleportCount = 0; // 记录传送次数
  }

  preload() {
    // 使用 Graphics 创建灰色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建玩家精灵（位于屏幕中心）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 允许移出边界
    
    // 设置移动速度
    this.moveSpeed = 300;
    
    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加 WASD 控制（可选）
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // 添加调试文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    console.log('Game started - Use arrow keys or WASD to move');
    console.log('Player will wrap around screen edges');
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);
    
    // 处理输入
    if (this.cursors.left.isDown || this.keys.a.isDown) {
      this.player.setVelocityX(-this.moveSpeed);
    } else if (this.cursors.right.isDown || this.keys.d.isDown) {
      this.player.setVelocityX(this.moveSpeed);
    }
    
    if (this.cursors.up.isDown || this.keys.w.isDown) {
      this.player.setVelocityY(-this.moveSpeed);
    } else if (this.cursors.down.isDown || this.keys.s.isDown) {
      this.player.setVelocityY(this.moveSpeed);
    }
    
    // 循环地图效果 - 检测边界并传送
    const padding = 16; // 玩家半宽
    
    // 左边界传送到右边
    if (this.player.x < -padding) {
      this.player.x = this.cameras.main.width + padding;
      this.teleportCount++;
    }
    // 右边界传送到左边
    else if (this.player.x > this.cameras.main.width + padding) {
      this.player.x = -padding;
      this.teleportCount++;
    }
    
    // 上边界传送到下边
    if (this.player.y < -padding) {
      this.player.y = this.cameras.main.height + padding;
      this.teleportCount++;
    }
    // 下边界传送到上边
    else if (this.player.y > this.cameras.main.height + padding) {
      this.player.y = -padding;
      this.teleportCount++;
    }
    
    // 更新状态变量
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);
    
    // 更新状态显示
    this.statusText.setText([
      `Position: (${this.playerX}, ${this.playerY})`,
      `Teleports: ${this.teleportCount}`,
      `Speed: ${this.moveSpeed}`
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
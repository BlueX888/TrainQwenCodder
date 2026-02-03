class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 可验证的状态信号
    this.playerX = 0;
    this.playerY = 0;
    this.wrapCount = 0; // 记录穿越边界次数
  }

  preload() {
    // 使用 Graphics 创建青色圆形纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x00FFFF, 1); // 青色
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建玩家精灵（居中位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许穿越
    
    // 设置玩家速度
    this.playerSpeed = 360;
    
    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加 WASD 键支持
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // 显示提示文本
    this.add.text(10, 10, 'Use Arrow Keys or WASD to move\nCyan player wraps around screen', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 显示状态信息
    this.statusText = this.add.text(10, 70, '', {
      fontSize: '14px',
      fill: '#00FFFF',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);
    
    // 处理输入
    if (this.cursors.left.isDown || this.keys.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown || this.keys.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }
    
    if (this.cursors.up.isDown || this.keys.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown || this.keys.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }
    
    // 对角线移动时标准化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }
    
    // 边界循环检测
    const padding = 32; // 玩家半径的缓冲
    
    // 左边界
    if (this.player.x < -padding) {
      this.player.x = this.cameras.main.width + padding;
      this.wrapCount++;
    }
    // 右边界
    else if (this.player.x > this.cameras.main.width + padding) {
      this.player.x = -padding;
      this.wrapCount++;
    }
    
    // 上边界
    if (this.player.y < -padding) {
      this.player.y = this.cameras.main.height + padding;
      this.wrapCount++;
    }
    // 下边界
    else if (this.player.y > this.cameras.main.height + padding) {
      this.player.y = -padding;
      this.wrapCount++;
    }
    
    // 更新状态变量
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);
    
    // 更新状态显示
    this.statusText.setText(
      `Position: (${this.playerX}, ${this.playerY})\n` +
      `Wrap Count: ${this.wrapCount}\n` +
      `Speed: ${this.playerSpeed}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
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
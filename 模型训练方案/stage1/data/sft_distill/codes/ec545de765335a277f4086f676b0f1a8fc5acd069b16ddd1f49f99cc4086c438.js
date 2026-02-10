class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerX = 0;
    this.playerY = 0;
    this.wrapCount = 0; // 用于验证循环次数的状态信号
  }

  preload() {
    // 使用 Graphics 创建蓝色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('playerTex', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建蓝色玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
    this.player.setCollideWorldBounds(false); // 不与边界碰撞，允许移出
    
    // 设置移动速度
    this.moveSpeed = 200;
    
    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加 WASD 键支持
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // 显示提示文本
    this.add.text(10, 10, 'Use Arrow Keys or WASD to move', {
      fontSize: '16px',
      color: '#ffffff'
    });
    
    // 显示循环次数
    this.wrapText = this.add.text(10, 30, 'Wrap Count: 0', {
      fontSize: '16px',
      color: '#ffffff'
    });
    
    // 显示位置信息
    this.posText = this.add.text(10, 50, '', {
      fontSize: '16px',
      color: '#ffffff'
    });
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);
    
    // 处理键盘输入
    if (this.cursors.left.isDown || this.keys.left.isDown) {
      this.player.setVelocityX(-this.moveSpeed);
    } else if (this.cursors.right.isDown || this.keys.right.isDown) {
      this.player.setVelocityX(this.moveSpeed);
    }
    
    if (this.cursors.up.isDown || this.keys.up.isDown) {
      this.player.setVelocityY(-this.moveSpeed);
    } else if (this.cursors.down.isDown || this.keys.down.isDown) {
      this.player.setVelocityY(this.moveSpeed);
    }
    
    // 处理边界循环效果
    const padding = 16; // 玩家半径
    
    // 左边界 -> 右边界
    if (this.player.x < -padding) {
      this.player.x = this.cameras.main.width + padding;
      this.wrapCount++;
    }
    // 右边界 -> 左边界
    else if (this.player.x > this.cameras.main.width + padding) {
      this.player.x = -padding;
      this.wrapCount++;
    }
    
    // 上边界 -> 下边界
    if (this.player.y < -padding) {
      this.player.y = this.cameras.main.height + padding;
      this.wrapCount++;
    }
    // 下边界 -> 上边界
    else if (this.player.y > this.cameras.main.height + padding) {
      this.player.y = -padding;
      this.wrapCount++;
    }
    
    // 更新状态信号
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);
    
    // 更新显示文本
    this.wrapText.setText(`Wrap Count: ${this.wrapCount}`);
    this.posText.setText(`Position: (${this.playerX}, ${this.playerY})`);
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
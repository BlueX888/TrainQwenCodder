class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.crossBoundaryCount = 0; // 可验证状态：穿越边界次数
  }

  preload() {
    // 创建绿色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 允许移出边界
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.updateStatusText();
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);
    
    // 键盘控制移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(160);
    }
    
    // 处理对角线移动时的速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      const normalized = this.player.body.velocity.normalize().scale(160);
      this.player.setVelocity(normalized.x, normalized.y);
    }
    
    // 循环边界检测
    const playerX = this.player.x;
    const playerY = this.player.y;
    let wrapped = false;
    
    // 左右边界
    if (playerX < -16) {
      this.player.x = this.game.config.width + 16;
      wrapped = true;
    } else if (playerX > this.game.config.width + 16) {
      this.player.x = -16;
      wrapped = true;
    }
    
    // 上下边界
    if (playerY < -16) {
      this.player.y = this.game.config.height + 16;
      wrapped = true;
    } else if (playerY > this.game.config.height + 16) {
      this.player.y = -16;
      wrapped = true;
    }
    
    // 记录穿越次数
    if (wrapped) {
      this.crossBoundaryCount++;
      this.updateStatusText();
    }
  }
  
  updateStatusText() {
    this.statusText.setText(
      `Boundary Crossings: ${this.crossBoundaryCount}\n` +
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
      `Use Arrow Keys to Move`
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);
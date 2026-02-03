class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.crossBoundaryCount = 0; // 状态信号：记录穿越边界次数
  }

  preload() {
    // 程序化生成橙色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8800, 1); // 橙色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 关闭世界边界碰撞，允许移出
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加WASD按键支持
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
    
    this.updateStatusText();
    
    // 添加边界线提示（可选）
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(2, 0xFFFFFF, 0.5);
    borderGraphics.strokeRect(0, 0, 800, 600);
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);
    
    // 处理键盘输入
    if (this.cursors.left.isDown || this.keys.a.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown || this.keys.d.isDown) {
      this.player.setVelocityX(160);
    }
    
    if (this.cursors.up.isDown || this.keys.w.isDown) {
      this.player.setVelocityY(-160);
    } else if (this.cursors.down.isDown || this.keys.s.isDown) {
      this.player.setVelocityY(160);
    }
    
    // 对角线移动时标准化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(160);
    }
    
    // 边界循环逻辑
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;
    let wrapped = false;
    
    // 左右边界
    if (this.player.x > 800 + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      wrapped = true;
    } else if (this.player.x < -playerWidth / 2) {
      this.player.x = 800 + playerWidth / 2;
      wrapped = true;
    }
    
    // 上下边界
    if (this.player.y > 600 + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      wrapped = true;
    } else if (this.player.y < -playerHeight / 2) {
      this.player.y = 600 + playerHeight / 2;
      wrapped = true;
    }
    
    // 更新穿越计数
    if (wrapped) {
      this.crossBoundaryCount++;
      this.updateStatusText();
    }
  }
  
  updateStatusText() {
    this.statusText.setText([
      'Boundary Crosses: ' + this.crossBoundaryCount,
      'Position: (' + Math.round(this.player.x) + ', ' + Math.round(this.player.y) + ')',
      'Speed: 160',
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

new Phaser.Game(config);
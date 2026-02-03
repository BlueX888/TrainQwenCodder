class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.crossCount = 0; // 穿越边界计数（状态验证信号）
  }

  preload() {
    // 使用 Graphics 生成橙色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8800, 1); // 橙色
    graphics.fillCircle(16, 16, 16); // 绘制圆形
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建橙色玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 允许移出边界
    
    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 显示穿越次数文本
    this.crossText = this.add.text(10, 10, 'Cross Count: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });
    
    // 显示位置信息（用于调试）
    this.posText = this.add.text(10, 40, '', {
      fontSize: '16px',
      fill: '#ffff00'
    });
    
    // 显示控制提示
    this.add.text(10, 560, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      fill: '#00ff00'
    });
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);
    
    // 键盘控制移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    }
    
    // 循环地图效果 - 检测边界并从对侧出现
    const padding = 16; // 玩家半径
    
    // 左右边界循环
    if (this.player.x < -padding) {
      this.player.x = 800 + padding;
      this.crossCount++;
      this.updateCrossText();
    } else if (this.player.x > 800 + padding) {
      this.player.x = -padding;
      this.crossCount++;
      this.updateCrossText();
    }
    
    // 上下边界循环
    if (this.player.y < -padding) {
      this.player.y = 600 + padding;
      this.crossCount++;
      this.updateCrossText();
    } else if (this.player.y > 600 + padding) {
      this.player.y = -padding;
      this.crossCount++;
      this.updateCrossText();
    }
    
    // 更新位置信息
    this.posText.setText(`Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`);
  }
  
  updateCrossText() {
    this.crossText.setText(`Cross Count: ${this.crossCount}`);
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
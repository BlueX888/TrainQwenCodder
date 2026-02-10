class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.wrapCount = 0; // 状态信号：记录穿越边界次数
  }

  preload() {
    // 程序化生成橙色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8800, 1); // 橙色
    graphics.fillCircle(16, 16, 16); // 绘制圆形玩家
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建玩家精灵，初始位置在屏幕中央
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 允许移出边界
    
    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 显示状态信息
    this.statusText = this.add.text(16, 16, 'Wrap Count: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);
    
    // 键盘输入控制移动
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
    
    // 边界循环逻辑
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;
    
    // 左边界穿越
    if (this.player.x < -playerWidth / 2) {
      this.player.x = this.game.config.width + playerWidth / 2;
      this.wrapCount++;
    }
    // 右边界穿越
    else if (this.player.x > this.game.config.width + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      this.wrapCount++;
    }
    
    // 上边界穿越
    if (this.player.y < -playerHeight / 2) {
      this.player.y = this.game.config.height + playerHeight / 2;
      this.wrapCount++;
    }
    // 下边界穿越
    else if (this.player.y > this.game.config.height + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      this.wrapCount++;
    }
    
    // 更新状态显示
    this.statusText.setText(`Wrap Count: ${this.wrapCount}`);
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
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.crossBorderCount = 0; // 穿越边界次数（验证信号）
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
    this.player.setCollideWorldBounds(false); // 关闭世界边界碰撞，允许移出边界
    
    // 设置玩家移动速度
    this.moveSpeed = 200;
    
    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加文本显示穿越次数
    this.statusText = this.add.text(10, 10, 'Border Crosses: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);
    
    // 处理键盘输入
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.moveSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.moveSpeed);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.moveSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.moveSpeed);
    }
    
    // 处理边界循环效果
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;
    
    // 左右边界循环
    if (this.player.x < -playerWidth / 2) {
      this.player.x = this.game.config.width + playerWidth / 2;
      this.crossBorderCount++;
      this.updateStatus();
    } else if (this.player.x > this.game.config.width + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      this.crossBorderCount++;
      this.updateStatus();
    }
    
    // 上下边界循环
    if (this.player.y < -playerHeight / 2) {
      this.player.y = this.game.config.height + playerHeight / 2;
      this.crossBorderCount++;
      this.updateStatus();
    } else if (this.player.y > this.game.config.height + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      this.crossBorderCount++;
      this.updateStatus();
    }
  }
  
  updateStatus() {
    this.statusText.setText('Border Crosses: ' + this.crossBorderCount);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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
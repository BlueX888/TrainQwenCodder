class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.crossBorderCount = 0; // 状态信号：穿越边界次数
  }

  preload() {
    // 使用 Graphics 创建蓝色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1); // 蓝色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('bluePlayer', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建蓝色玩家精灵，放置在屏幕中心
    this.player = this.physics.add.sprite(400, 300, 'bluePlayer');
    this.player.setCollideWorldBounds(false); // 关闭世界边界碰撞，允许移出边界
    
    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 显示穿越边界次数的文本
    this.scoreText = this.add.text(16, 16, 'Border Crosses: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });
    
    // 添加说明文本
    this.add.text(16, 550, 'Use Arrow Keys to Move (Speed: 120)', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // 重置玩家速度
    this.player.setVelocity(0);
    
    // 键盘控制移动，速度 120
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-120);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(120);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-120);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(120);
    }
    
    // 处理对角线移动时的速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.setVelocity(
        this.player.body.velocity.x * 0.707,
        this.player.body.velocity.y * 0.707
      );
    }
    
    // 循环地图效果：检测边界并从对侧出现
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;
    
    // 左右边界循环
    if (this.player.x < -playerWidth / 2) {
      this.player.x = this.game.config.width + playerWidth / 2;
      this.crossBorderCount++;
      this.updateScoreText();
    } else if (this.player.x > this.game.config.width + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      this.crossBorderCount++;
      this.updateScoreText();
    }
    
    // 上下边界循环
    if (this.player.y < -playerHeight / 2) {
      this.player.y = this.game.config.height + playerHeight / 2;
      this.crossBorderCount++;
      this.updateScoreText();
    } else if (this.player.y > this.game.config.height + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      this.crossBorderCount++;
      this.updateScoreText();
    }
  }
  
  updateScoreText() {
    this.scoreText.setText('Border Crosses: ' + this.crossBorderCount);
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
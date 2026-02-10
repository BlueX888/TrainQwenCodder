class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.crossBoundaryCount = 0; // 可验证的状态信号：穿越边界次数
  }

  preload() {
    // 使用 Graphics 创建粉色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF69B4, 1); // 粉色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建粉色玩家精灵，位于屏幕中央
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许移出
    
    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加 WASD 键支持
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // 显示穿越边界次数
    this.scoreText = this.add.text(16, 16, 'Boundary Crosses: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 显示控制提示
    this.add.text(16, 50, 'Use Arrow Keys or WASD to move', {
      fontSize: '16px',
      fill: '#cccccc'
    });
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);
    
    // 处理键盘输入，设置移动速度为360
    const speed = 360;
    
    if (this.cursors.left.isDown || this.keys.A.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      this.player.setVelocityX(speed);
    }
    
    if (this.cursors.up.isDown || this.keys.W.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      this.player.setVelocityY(speed);
    }
    
    // 处理对角线移动时的速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }
    
    // 循环地图效果：检测边界并从对侧出现
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;
    
    // 左边界检测
    if (this.player.x < -playerWidth / 2) {
      this.player.x = this.cameras.main.width + playerWidth / 2;
      this.crossBoundaryCount++;
      this.updateScore();
    }
    
    // 右边界检测
    if (this.player.x > this.cameras.main.width + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      this.crossBoundaryCount++;
      this.updateScore();
    }
    
    // 上边界检测
    if (this.player.y < -playerHeight / 2) {
      this.player.y = this.cameras.main.height + playerHeight / 2;
      this.crossBoundaryCount++;
      this.updateScore();
    }
    
    // 下边界检测
    if (this.player.y > this.cameras.main.height + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      this.crossBoundaryCount++;
      this.updateScore();
    }
  }
  
  updateScore() {
    this.scoreText.setText('Boundary Crosses: ' + this.crossBoundaryCount);
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
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.wrapCount = 0; // 状态信号：记录循环边界次数
  }

  preload() {
    // 使用 Graphics 创建青色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('playerTex', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建青色玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
    this.player.setCollideWorldBounds(false); // 允许移出边界
    
    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 显示循环次数文本
    this.wrapText = this.add.text(10, 10, 'Wrap Count: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });
    
    // 显示位置信息
    this.posText = this.add.text(10, 40, 'Position: (400, 300)', {
      fontSize: '16px',
      fill: '#ffffff'
    });
    
    // 显示控制提示
    this.add.text(10, 70, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    const speed = 80;
    
    // 重置速度
    this.player.setVelocity(0);
    
    // 方向键控制移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }
    
    // 边界循环检测
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;
    
    let wrapped = false;
    
    // 左右边界循环
    if (this.player.x < -playerWidth / 2) {
      this.player.x = gameWidth + playerWidth / 2;
      wrapped = true;
    } else if (this.player.x > gameWidth + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      wrapped = true;
    }
    
    // 上下边界循环
    if (this.player.y < -playerHeight / 2) {
      this.player.y = gameHeight + playerHeight / 2;
      wrapped = true;
    } else if (this.player.y > gameHeight + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      wrapped = true;
    }
    
    // 更新循环计数
    if (wrapped) {
      this.wrapCount++;
      this.wrapText.setText('Wrap Count: ' + this.wrapCount);
    }
    
    // 更新位置信息
    this.posText.setText(
      'Position: (' + 
      Math.round(this.player.x) + ', ' + 
      Math.round(this.player.y) + ')'
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
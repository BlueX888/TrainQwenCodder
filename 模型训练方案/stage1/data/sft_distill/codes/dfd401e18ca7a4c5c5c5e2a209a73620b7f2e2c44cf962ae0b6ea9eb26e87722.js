class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.crossBorderCount = 0; // 穿越边界次数（状态信号）
  }

  preload() {
    // 使用 Graphics 创建白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建玩家精灵（白色方块）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 不与边界碰撞，允许移出
    
    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
    
    this.updateStatusText();
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);
    
    // 键盘控制移动（速度 80）
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-80);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(80);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-80);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(80);
    }
    
    // 处理边界循环效果
    this.handleBorderWrap();
    
    // 更新状态显示
    this.updateStatusText();
  }

  handleBorderWrap() {
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;
    let wrapped = false;
    
    // 左边界穿越到右边
    if (this.player.x < -playerWidth / 2) {
      this.player.x = this.game.config.width + playerWidth / 2;
      wrapped = true;
    }
    // 右边界穿越到左边
    else if (this.player.x > this.game.config.width + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      wrapped = true;
    }
    
    // 上边界穿越到下边
    if (this.player.y < -playerHeight / 2) {
      this.player.y = this.game.config.height + playerHeight / 2;
      wrapped = true;
    }
    // 下边界穿越到上边
    else if (this.player.y > this.game.config.height + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      wrapped = true;
    }
    
    // 记录穿越次数
    if (wrapped) {
      this.crossBorderCount++;
    }
  }

  updateStatusText() {
    this.statusText.setText([
      'Use Arrow Keys to Move (Speed: 80)',
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Border Crosses: ${this.crossBorderCount}`
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
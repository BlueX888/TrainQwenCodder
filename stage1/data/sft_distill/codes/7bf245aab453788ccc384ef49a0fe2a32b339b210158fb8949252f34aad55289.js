class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.crossBorderCount = 0; // 状态信号：记录穿越边界次数
  }

  preload() {
    // 使用 Graphics 创建灰色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建玩家精灵（中心位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 允许移出边界
    
    // 设置移动速度
    this.moveSpeed = 200;
    
    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加 WASD 键支持
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.updateStatusText();
    
    // 添加边界线（可视化）
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(2, 0xffffff, 0.5);
    borderGraphics.strokeRect(0, 0, 800, 600);
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);
    
    // 处理键盘输入
    if (this.cursors.left.isDown || this.keys.A.isDown) {
      this.player.setVelocityX(-this.moveSpeed);
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      this.player.setVelocityX(this.moveSpeed);
    }
    
    if (this.cursors.up.isDown || this.keys.W.isDown) {
      this.player.setVelocityY(-this.moveSpeed);
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      this.player.setVelocityY(this.moveSpeed);
    }
    
    // 处理边界循环
    this.handleWorldWrap();
    
    // 更新状态显示
    this.updateStatusText();
  }
  
  handleWorldWrap() {
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;
    const worldWidth = this.cameras.main.width;
    const worldHeight = this.cameras.main.height;
    
    let wrapped = false;
    
    // 左边界检测
    if (this.player.x < -playerWidth / 2) {
      this.player.x = worldWidth + playerWidth / 2;
      wrapped = true;
    }
    // 右边界检测
    else if (this.player.x > worldWidth + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      wrapped = true;
    }
    
    // 上边界检测
    if (this.player.y < -playerHeight / 2) {
      this.player.y = worldHeight + playerHeight / 2;
      wrapped = true;
    }
    // 下边界检测
    else if (this.player.y > worldHeight + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      wrapped = true;
    }
    
    // 如果发生了边界穿越，增加计数
    if (wrapped) {
      this.crossBorderCount++;
    }
  }
  
  updateStatusText() {
    const posX = Math.round(this.player.x);
    const posY = Math.round(this.player.y);
    this.statusText.setText(
      `Position: (${posX}, ${posY})\n` +
      `Border Crosses: ${this.crossBorderCount}\n` +
      `Speed: ${this.moveSpeed}\n` +
      `Controls: Arrow Keys or WASD`
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
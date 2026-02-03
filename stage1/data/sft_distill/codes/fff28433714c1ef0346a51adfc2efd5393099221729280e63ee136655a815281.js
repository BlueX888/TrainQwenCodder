class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.wrapCount = 0; // 状态信号：记录穿越边界次数
  }

  preload() {
    // 使用 Graphics 创建橙色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8C00, 1); // 橙色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建玩家精灵（居中位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 关闭世界边界碰撞，允许移出
    
    // 设置移动速度
    this.moveSpeed = 300;
    
    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加 WASD 键支持
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
    
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
    
    // 边界循环检测
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;
    let wrapped = false;
    
    // 左右边界
    if (this.player.x < -playerWidth / 2) {
      this.player.x = this.cameras.main.width + playerWidth / 2;
      wrapped = true;
    } else if (this.player.x > this.cameras.main.width + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      wrapped = true;
    }
    
    // 上下边界
    if (this.player.y < -playerHeight / 2) {
      this.player.y = this.cameras.main.height + playerHeight / 2;
      wrapped = true;
    } else if (this.player.y > this.cameras.main.height + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      wrapped = true;
    }
    
    // 更新穿越计数
    if (wrapped) {
      this.wrapCount++;
      this.updateStatusText();
    }
  }
  
  updateStatusText() {
    this.statusText.setText(
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
      `Wrap Count: ${this.wrapCount}\n` +
      `Speed: ${this.moveSpeed}\n` +
      `Use Arrow Keys or WASD to move`
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
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.wrapCount = 0; // 状态信号：记录穿越边界次数
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
    // 创建玩家精灵（物理对象）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 允许移出边界
    
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
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);
    
    // 处理键盘输入
    let moving = false;
    
    if (this.cursors.left.isDown || this.keys.A.isDown) {
      this.player.setVelocityX(-360);
      moving = true;
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      this.player.setVelocityX(360);
      moving = true;
    }
    
    if (this.cursors.up.isDown || this.keys.W.isDown) {
      this.player.setVelocityY(-360);
      moving = true;
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      this.player.setVelocityY(360);
      moving = true;
    }
    
    // 对角线移动时归一化速度
    if (moving) {
      this.player.body.velocity.normalize().scale(360);
    }
    
    // 循环地图效果：检测边界并从对侧出现
    const padding = 16; // 玩家半径
    let wrapped = false;
    
    // 左右边界
    if (this.player.x < -padding) {
      this.player.x = this.cameras.main.width + padding;
      wrapped = true;
    } else if (this.player.x > this.cameras.main.width + padding) {
      this.player.x = -padding;
      wrapped = true;
    }
    
    // 上下边界
    if (this.player.y < -padding) {
      this.player.y = this.cameras.main.height + padding;
      wrapped = true;
    } else if (this.player.y > this.cameras.main.height + padding) {
      this.player.y = -padding;
      wrapped = true;
    }
    
    // 更新穿越计数
    if (wrapped) {
      this.wrapCount++;
      this.updateStatusText();
    }
  }
  
  updateStatusText() {
    this.statusText.setText([
      'Use Arrow Keys or WASD to move',
      `Speed: 360 px/s`,
      `Wrap Count: ${this.wrapCount}`,
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
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
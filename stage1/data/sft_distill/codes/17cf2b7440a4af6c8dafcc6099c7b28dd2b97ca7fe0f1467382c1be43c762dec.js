class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.wrapCount = 0; // 记录穿越边界次数
    this.playerX = 0;
    this.playerY = 0;
  }

  preload() {
    // 使用 Graphics 创建绿色玩家纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建玩家精灵（带物理系统）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 允许移出边界
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 创建信息文本显示状态
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 绘制边界参考线
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 0.3);
    graphics.strokeRect(0, 0, 800, 600);
    
    this.updateInfo();
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);
    
    // 处理键盘输入，设置速度为 80
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
    
    // 处理对角线移动，保持速度恒定
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      const normalized = Math.sqrt(2) / 2;
      this.player.setVelocity(
        this.player.body.velocity.x * normalized,
        this.player.body.velocity.y * normalized
      );
    }
    
    // 循环地图效果：检测边界并从对侧出现
    const margin = 16; // 玩家半径
    let wrapped = false;
    
    // 左右边界
    if (this.player.x < -margin) {
      this.player.x = 800 + margin;
      wrapped = true;
    } else if (this.player.x > 800 + margin) {
      this.player.x = -margin;
      wrapped = true;
    }
    
    // 上下边界
    if (this.player.y < -margin) {
      this.player.y = 600 + margin;
      wrapped = true;
    } else if (this.player.y > 600 + margin) {
      this.player.y = -margin;
      wrapped = true;
    }
    
    // 如果发生穿越，增加计数
    if (wrapped) {
      this.wrapCount++;
    }
    
    // 更新状态信号
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);
    
    this.updateInfo();
  }
  
  updateInfo() {
    // 更新信息显示
    this.infoText.setText([
      `Player Position: (${this.playerX}, ${this.playerY})`,
      `Wrap Count: ${this.wrapCount}`,
      `Speed: 80`,
      '',
      'Use Arrow Keys to Move'
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
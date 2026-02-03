class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.playerX = 0;
    this.playerY = 0;
    this.wrapCount = 0; // 记录循环次数
  }

  preload() {
    // 使用 Graphics 创建青色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00FFFF, 1); // 青色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建青色玩家精灵（居中位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 不碰撞边界，允许移出
    
    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 创建文本显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 初始化状态
    this.updateStatus();
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);
    
    const speed = 360;
    
    // 处理键盘输入
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
    
    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      const normalizedSpeed = speed / Math.sqrt(2);
      this.player.setVelocity(
        this.player.body.velocity.x > 0 ? normalizedSpeed : -normalizedSpeed,
        this.player.body.velocity.y > 0 ? normalizedSpeed : -normalizedSpeed
      );
    }
    
    // 实现循环地图效果
    this.wrapPlayer();
    
    // 更新状态显示
    this.updateStatus();
  }

  wrapPlayer() {
    const padding = 16; // 玩家半径
    let wrapped = false;
    
    // 左右边界循环
    if (this.player.x < -padding) {
      this.player.x = this.cameras.main.width + padding;
      wrapped = true;
    } else if (this.player.x > this.cameras.main.width + padding) {
      this.player.x = -padding;
      wrapped = true;
    }
    
    // 上下边界循环
    if (this.player.y < -padding) {
      this.player.y = this.cameras.main.height + padding;
      wrapped = true;
    } else if (this.player.y > this.cameras.main.height + padding) {
      this.player.y = -padding;
      wrapped = true;
    }
    
    // 如果发生循环，增加计数
    if (wrapped) {
      this.wrapCount++;
    }
  }

  updateStatus() {
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);
    
    this.statusText.setText([
      `Position: (${this.playerX}, ${this.playerY})`,
      `Wrap Count: ${this.wrapCount}`,
      `Speed: 360`,
      `Use Arrow Keys to Move`
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
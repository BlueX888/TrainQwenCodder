class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置世界边界为 1600x1200
    this.physics.world.setBounds(0, 0, 1600, 1200);

    // 绘制场景背景网格，方便观察相机移动
    const graphics = this.add.graphics();
    
    // 绘制背景
    graphics.fillStyle(0x2d2d2d, 1);
    graphics.fillRect(0, 0, 1600, 1200);
    
    // 绘制网格线
    graphics.lineStyle(1, 0x444444, 0.5);
    
    // 垂直线
    for (let x = 0; x <= 1600; x += 100) {
      graphics.lineBetween(x, 0, x, 1200);
    }
    
    // 水平线
    for (let y = 0; y <= 1200; y += 100) {
      graphics.lineBetween(0, y, 1600, y);
    }
    
    // 绘制边界标记
    graphics.lineStyle(3, 0xff0000, 1);
    graphics.strokeRect(0, 0, 1600, 1200);
    
    // 添加坐标文字标记
    this.add.text(10, 10, '(0, 0)', { 
      fontSize: '16px', 
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setScrollFactor(0);
    
    this.add.text(1500, 10, '(1600, 0)', { 
      fontSize: '16px', 
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    
    this.add.text(10, 1170, '(0, 1200)', { 
      fontSize: '16px', 
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    
    this.add.text(1450, 1170, '(1600, 1200)', { 
      fontSize: '16px', 
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(800, 600, 'player');
    this.player.setCollideWorldBounds(true);

    // **关键：设置相机边界，限制相机只能在场景范围内移动**
    this.cameras.main.setBounds(0, 0, 1600, 1200);
    
    // 让相机跟随玩家
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加操作提示
    this.add.text(10, 40, '使用方向键移动玩家\n相机将跟随玩家但不会超出场景边界', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setScrollFactor(0);

    // 显示相机位置信息
    this.cameraInfo = this.add.text(10, 100, '', {
      fontSize: '12px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setScrollFactor(0);
  }

  update(time, delta) {
    const speed = 300;

    // 重置速度
    this.player.setVelocity(0);

    // 键盘控制
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

    // 更新相机位置信息
    const cam = this.cameras.main;
    this.cameraInfo.setText(
      `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
      `相机位置: (${Math.round(cam.scrollX)}, ${Math.round(cam.scrollY)})\n` +
      `相机边界: (0, 0) - (1600, 1200)`
    );
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);
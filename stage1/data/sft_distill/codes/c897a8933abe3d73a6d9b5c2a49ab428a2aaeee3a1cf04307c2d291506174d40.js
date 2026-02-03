class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.bullets = null;
    this.cursors = null;
    this.rotationSpeed = 3; // 每秒旋转角度
    this.bulletSpeed = 120;
    this.shotCount = 0;
    this.activeBullets = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建玩家纹理（三角形表示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);  // 尖端指向右侧
    playerGraphics.lineTo(-10, -10);
    playerGraphics.lineTo(-10, 10);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xff0000, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.angle = 0; // 初始朝向右侧

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: false
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 鼠标左键射击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.shootBullet();
      }
    });

    // 初始化信号
    window.__signals__ = {
      shotCount: 0,
      activeBullets: 0,
      playerAngle: 0,
      playerPosition: { x: 400, y: 300 }
    };

    // 添加提示文本
    this.add.text(10, 10, '左右键旋转，鼠标左键射击', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 显示状态文本
    this.statusText = this.add.text(10, 40, '', {
      fontSize: '14px',
      fill: '#00ff00'
    });
  }

  shootBullet() {
    // 从对象池获取子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 根据玩家角度计算速度
      const angleInRadians = Phaser.Math.DegToRad(this.player.angle);
      const velocityX = Math.cos(angleInRadians) * this.bulletSpeed;
      const velocityY = Math.sin(angleInRadians) * this.bulletSpeed;
      
      bullet.setVelocity(velocityX, velocityY);
      bullet.angle = this.player.angle;
      
      this.shotCount++;
      
      // 输出射击日志
      console.log(JSON.stringify({
        event: 'bullet_fired',
        shotCount: this.shotCount,
        angle: this.player.angle,
        position: { x: this.player.x, y: this.player.y }
      }));
    }
  }

  update(time, delta) {
    // 玩家旋转控制
    if (this.cursors.left.isDown) {
      this.player.angle -= this.rotationSpeed * (delta / 1000) * 60;
    } else if (this.cursors.right.isDown) {
      this.player.angle += this.rotationSpeed * (delta / 1000) * 60;
    }

    // 归一化角度到 0-360
    if (this.player.angle < 0) {
      this.player.angle += 360;
    } else if (this.player.angle >= 360) {
      this.player.angle -= 360;
    }

    // 清理超出边界的子弹
    this.activeBullets = 0;
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        this.activeBullets++;
        
        // 检查是否超出边界
        if (bullet.x < -20 || bullet.x > 820 || 
            bullet.y < -20 || bullet.y > 620) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.setVelocity(0, 0);
        }
      }
    });

    // 更新状态信号
    window.__signals__ = {
      shotCount: this.shotCount,
      activeBullets: this.activeBullets,
      playerAngle: Math.round(this.player.angle * 10) / 10,
      playerPosition: { 
        x: Math.round(this.player.x), 
        y: Math.round(this.player.y) 
      }
    };

    // 更新状态显示
    this.statusText.setText(
      `射击次数: ${this.shotCount} | 活跃子弹: ${this.activeBullets} | 角度: ${Math.round(this.player.angle)}°`
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
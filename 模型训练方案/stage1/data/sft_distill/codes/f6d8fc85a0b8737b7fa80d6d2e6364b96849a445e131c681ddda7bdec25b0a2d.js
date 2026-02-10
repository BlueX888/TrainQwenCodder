class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证的状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理（三角形表示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);  // 顶点（朝向）
    playerGraphics.lineTo(-10, -10);
    playerGraphics.lineTo(-10, 10);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆点）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
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
        this.fireBullet();
      }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 显示操作提示
    this.add.text(10, height - 60, 'Controls:', {
      fontSize: '14px',
      fill: '#ffffff'
    });
    this.add.text(10, height - 40, 'Left/Right Arrow: Rotate', {
      fontSize: '14px',
      fill: '#ffffff'
    });
    this.add.text(10, height - 20, 'Left Click: Fire', {
      fontSize: '14px',
      fill: '#ffffff'
    });
  }

  fireBullet() {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹角度与玩家一致
      bullet.angle = this.player.angle;
      
      // 根据玩家角度计算速度向量（速度 160）
      const velocity = this.physics.velocityFromAngle(
        this.player.angle,
        160
      );
      
      bullet.body.setVelocity(velocity.x, velocity.y);
      
      // 增加计数器
      this.bulletsFired++;
      
      console.log(`Bullet fired! Total: ${this.bulletsFired}, Angle: ${this.player.angle.toFixed(1)}°`);
    }
  }

  update(time, delta) {
    // 玩家旋转控制
    const rotationSpeed = 3; // 度/帧
    
    if (this.cursors.left.isDown) {
      this.player.angle -= rotationSpeed;
    } else if (this.cursors.right.isDown) {
      this.player.angle += rotationSpeed;
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        const { width, height } = this.cameras.main;
        if (
          bullet.x < -20 ||
          bullet.x > width + 20 ||
          bullet.y < -20 ||
          bullet.y > height + 20
        ) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.setVelocity(0, 0);
        }
      }
    });

    // 更新状态显示
    const activeBullets = this.bullets.countActive(true);
    this.statusText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${activeBullets}`,
      `Player Angle: ${this.player.angle.toFixed(1)}°`
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
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 验证状态信号
    this.rotationSpeed = 3; // 旋转速度（度/帧）
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建玩家纹理（三角形指示方向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0); // 尖端朝右
    playerGraphics.lineTo(-10, -10);
    playerGraphics.lineTo(-10, 10);
    playerGraphics.closePath();
    playerGraphics.fill();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 创建子弹纹理（圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
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
      runChildUpdate: true
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 鼠标右键射击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.shootBullet();
      }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 提示文本
    this.add.text(10, 550, 'Left/Right: Rotate | Right Click: Shoot', {
      fontSize: '14px',
      fill: '#aaaaaa'
    });
  }

  update(time, delta) {
    // 玩家旋转控制
    if (this.cursors.left.isDown) {
      this.player.angle -= this.rotationSpeed;
    } else if (this.cursors.right.isDown) {
      this.player.angle += this.rotationSpeed;
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        if (bullet.x < -20 || bullet.x > 820 || 
            bullet.y < -20 || bullet.y > 620) {
          this.bullets.killAndHide(bullet);
          bullet.body.enable = false;
        }
      }
    });

    // 更新状态文本
    this.statusText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Player Angle: ${Math.round(this.player.angle)}°`,
      `Active Bullets: ${this.bullets.countActive(true)}`
    ]);
  }

  shootBullet() {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;

      // 根据玩家角度设置子弹速度
      const velocity = this.physics.velocityFromAngle(
        this.player.angle, 
        160
      );
      
      bullet.setVelocity(velocity.x, velocity.y);
      bullet.angle = this.player.angle;

      // 增加发射计数
      this.bulletsFired++;
    }
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
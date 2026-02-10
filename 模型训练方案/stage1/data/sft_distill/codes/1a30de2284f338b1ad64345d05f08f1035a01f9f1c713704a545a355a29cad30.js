class ShootingScene extends Phaser.Scene {
  constructor() {
    super('ShootingScene');
    this.bulletsFired = 0; // 可验证的状态信号
    this.activeBullets = 0; // 当前活跃子弹数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（三角形表示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0); // 箭头尖端
    playerGraphics.lineTo(-10, -10);
    playerGraphics.lineTo(-10, 10);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xff0000, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.99);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 鼠标右键输入
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.shootBullet();
      }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 550, 'A/D or Arrow Keys: Rotate | Right Click: Shoot', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 玩家旋转控制
    const rotationSpeed = 3;
    
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.angle -= rotationSpeed;
    }
    
    if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.angle += rotationSpeed;
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        if (bullet.x < -50 || bullet.x > 850 || 
            bullet.y < -50 || bullet.y > 650) {
          this.bullets.killAndHide(bullet);
          bullet.body.enable = false;
          this.activeBullets--;
          this.updateStatusText();
        }
      }
    });
  }

  shootBullet() {
    // 从子弹组获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;

      // 设置子弹角度与玩家一致
      bullet.setRotation(this.player.rotation);

      // 计算子弹速度方向（基于玩家角度）
      const angleInRadians = Phaser.Math.DegToRad(this.player.angle);
      const velocityX = Math.cos(angleInRadians) * 300;
      const velocityY = Math.sin(angleInRadians) * 300;

      bullet.body.setVelocity(velocityX, velocityY);

      // 更新统计
      this.bulletsFired++;
      this.activeBullets++;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Bullets Fired: ${this.bulletsFired} | Active: ${this.activeBullets} | Angle: ${Math.round(this.player.angle)}°`
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
  scene: ShootingScene
};

new Phaser.Game(config);
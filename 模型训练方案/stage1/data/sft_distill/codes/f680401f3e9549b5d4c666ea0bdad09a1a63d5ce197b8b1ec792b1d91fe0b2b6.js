class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 验证信号：发射的子弹数量
    this.playerRotationSpeed = 0; // 验证信号：当前旋转速度
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理（三角形，指向上方）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(16, 0);      // 顶点
    playerGraphics.lineTo(0, 32);      // 左下
    playerGraphics.lineTo(32, 32);     // 右下
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.99);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 设置键盘输入
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 射击冷却
    this.lastFired = 0;
    this.fireRate = 200; // 毫秒

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // 处理旋转
    this.playerRotationSpeed = 0;
    const rotationSpeed = 3; // 度/帧

    if (this.keys.A.isDown) {
      this.player.angle -= rotationSpeed;
      this.playerRotationSpeed = -rotationSpeed;
    }
    if (this.keys.D.isDown) {
      this.player.angle += rotationSpeed;
      this.playerRotationSpeed = rotationSpeed;
    }

    // 处理射击
    if (this.keys.W.isDown && time > this.lastFired + this.fireRate) {
      this.fireBullet();
      this.lastFired = time;
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        const bounds = this.physics.world.bounds;
        if (bullet.x < bounds.x - 50 || bullet.x > bounds.right + 50 ||
            bullet.y < bounds.y - 50 || bullet.y > bounds.bottom + 50) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });

    // 更新调试信息
    this.debugText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Player Angle: ${Math.round(this.player.angle)}°`,
      `Rotation Speed: ${this.playerRotationSpeed}°/frame`,
      `Active Bullets: ${this.bullets.countActive(true)}`,
      '',
      'Controls:',
      'A/D - Rotate',
      'W - Fire'
    ]);
  }

  fireBullet() {
    // 获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 计算子弹速度（根据玩家角度）
      // Phaser中角度0度指向右侧，-90度指向上方
      const angleInRadians = Phaser.Math.DegToRad(this.player.angle - 90);
      const bulletSpeed = 400;
      
      const velocityX = Math.cos(angleInRadians) * bulletSpeed;
      const velocityY = Math.sin(angleInRadians) * bulletSpeed;
      
      bullet.setVelocity(velocityX, velocityY);
      bullet.setRotation(angleInRadians);
      
      // 增加发射计数
      this.bulletsFired++;
    }
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
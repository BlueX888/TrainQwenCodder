class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 验证信号：发射的子弹总数
    this.activeBullets = 0; // 验证信号：当前活跃的子弹数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理（三角形指示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);      // 顶点（前方）
    playerGraphics.lineTo(-10, -10);   // 左下
    playerGraphics.lineTo(-10, 10);    // 右下
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

    // 创建玩家精灵
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: true
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 鼠标左键射击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.shootBullet();
      }
    });

    // 显示状态信息
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(10, height - 60, 'Controls:\nA/D or Arrow Keys: Rotate\nLeft Click: Shoot', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStats();
  }

  update(time, delta) {
    // 玩家旋转控制
    const rotationSpeed = 3; // 度/帧
    
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.angle -= rotationSpeed;
    }
    if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.angle += rotationSpeed;
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        const bounds = this.cameras.main;
        if (bullet.x < -50 || bullet.x > bounds.width + 50 ||
            bullet.y < -50 || bullet.y > bounds.height + 50) {
          bullet.setActive(false);
          bullet.setVisible(false);
          this.activeBullets--;
          this.updateStats();
        }
      }
    });
  }

  shootBullet() {
    // 从对象池获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 根据玩家角度计算速度
      const bulletSpeed = 400;
      const velocity = this.physics.velocityFromAngle(
        this.player.angle,
        bulletSpeed
      );

      bullet.setVelocity(velocity.x, velocity.y);
      bullet.setRotation(Phaser.Math.DegToRad(this.player.angle));

      // 更新统计
      this.bulletsFired++;
      this.activeBullets++;
      this.updateStats();
    }
  }

  updateStats() {
    this.statsText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.activeBullets}`,
      `Player Angle: ${Math.round(this.player.angle)}°`
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
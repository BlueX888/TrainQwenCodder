class ShootingScene extends Phaser.Scene {
  constructor() {
    super('ShootingScene');
    this.bulletsFired = 0; // 验证信号：发射的子弹总数
    this.activeBullets = 0; // 验证信号：当前活跃子弹数
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（三角形表示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);  // 顶点（朝向）
    playerGraphics.lineTo(-10, -10);
    playerGraphics.lineTo(-10, 10);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
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

    // 鼠标输入 - 左键发射
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.fireBullet();
      }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加提示文本
    this.add.text(400, 550, '使用 A/D 或 左/右箭头 旋转 | 鼠标左键发射', {
      fontSize: '14px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.updateStatusText();
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
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        if (bullet.x < -50 || bullet.x > 850 || 
            bullet.y < -50 || bullet.y > 650) {
          bullet.setActive(false);
          bullet.setVisible(false);
          this.activeBullets--;
          this.updateStatusText();
        }
      }
    });
  }

  fireBullet() {
    // 从对象池获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹角度与玩家一致
      bullet.setRotation(this.player.rotation);
      
      // 根据玩家角度设置子弹速度
      const bulletSpeed = 160;
      const velocity = this.physics.velocityFromAngle(
        this.player.angle, 
        bulletSpeed
      );
      
      bullet.setVelocity(velocity.x, velocity.y);
      
      // 更新统计
      this.bulletsFired++;
      this.activeBullets++;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText([
      `子弹总发射数: ${this.bulletsFired}`,
      `当前活跃子弹: ${this.activeBullets}`,
      `玩家角度: ${Math.round(this.player.angle)}°`
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
  scene: ShootingScene
};

new Phaser.Game(config);
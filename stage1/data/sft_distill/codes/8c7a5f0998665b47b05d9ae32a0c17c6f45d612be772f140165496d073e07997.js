class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shotsFired = 0; // 状态信号：发射子弹数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 生成玩家纹理（三角形表示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);  // 顶点（指向右侧）
    playerGraphics.lineTo(-10, -10);
    playerGraphics.lineTo(-10, 10);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 生成子弹纹理（圆形）
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
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 防止空格键连发
    this.canShoot = true;
    this.shootCooldown = 200; // 毫秒

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    // 提示文字
    this.add.text(400, 550, '方向键旋转 | 空格键射击', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.updateStatusText();
  }

  update(time, delta) {
    // 玩家旋转控制
    const rotationSpeed = 3; // 度/帧
    if (this.cursors.left.isDown) {
      this.player.angle -= rotationSpeed;
    }
    if (this.cursors.right.isDown) {
      this.player.angle += rotationSpeed;
    }

    // 射击控制
    if (this.spaceKey.isDown && this.canShoot) {
      this.shoot();
      this.canShoot = false;
      
      // 冷却时间
      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        if (bullet.x < -10 || bullet.x > 810 || 
            bullet.y < -10 || bullet.y > 610) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });

    this.updateStatusText();
  }

  shoot() {
    // 获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 计算子弹速度方向（基于玩家旋转角度）
      const angleInRadians = Phaser.Math.DegToRad(this.player.angle);
      const velocityX = Math.cos(angleInRadians) * 240;
      const velocityY = Math.sin(angleInRadians) * 240;
      
      bullet.setVelocity(velocityX, velocityY);
      bullet.setRotation(angleInRadians);
      
      // 统计射击次数
      this.shotsFired++;
    }
  }

  updateStatusText() {
    this.statusText.setText([
      `发射子弹数: ${this.shotsFired}`,
      `玩家角度: ${Math.round(this.player.angle)}°`,
      `活跃子弹: ${this.bullets.countActive(true)}`
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
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletCount = 0; // 状态信号：已发射子弹数
    this.activeShots = 0; // 状态信号：当前活跃子弹数
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理（三角形表示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);  // 尖端指向右
    playerGraphics.lineTo(-10, -10);
    playerGraphics.lineTo(-10, 10);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 创建子弹纹理（圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xff0000, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.95);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: true
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 射击冷却
    this.shootCooldown = 0;

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加说明文本
    this.add.text(10, height - 60, 'Arrow Keys: Rotate\nWASD: Shoot', {
      fontSize: '14px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // 旋转控制
    if (this.cursors.left.isDown) {
      this.player.angle -= 3;
    }
    if (this.cursors.right.isDown) {
      this.player.angle += 3;
    }

    // 射击控制（带冷却）
    if (this.shootCooldown > 0) {
      this.shootCooldown -= delta;
    }

    if (this.shootCooldown <= 0) {
      if (this.wasd.up.isDown) {
        this.shoot();
      } else if (this.wasd.down.isDown) {
        this.shoot(180); // 反向
      } else if (this.wasd.left.isDown) {
        this.shoot(-90); // 左侧
      } else if (this.wasd.right.isDown) {
        this.shoot(90); // 右侧
      }
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        const bounds = this.cameras.main;
        if (bullet.x < -20 || bullet.x > bounds.width + 20 ||
            bullet.y < -20 || bullet.y > bounds.height + 20) {
          bullet.setActive(false);
          bullet.setVisible(false);
          this.activeShots--;
        }
      }
    });

    // 更新状态显示
    this.statusText.setText(
      `Bullets Fired: ${this.bulletCount}\n` +
      `Active Shots: ${this.activeShots}\n` +
      `Player Angle: ${Math.round(this.player.angle)}°`
    );
  }

  shoot(angleOffset = 0) {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 计算发射角度（玩家角度 + 偏移）
      const angle = this.player.angle + angleOffset;
      
      // 根据角度设置速度
      const velocity = this.physics.velocityFromAngle(angle, 300);
      bullet.setVelocity(velocity.x, velocity.y);
      
      // 设置子弹角度（可选，用于视觉效果）
      bullet.angle = angle;

      // 更新统计
      this.bulletCount++;
      this.activeShots++;

      // 设置冷却时间（毫秒）
      this.shootCooldown = 200;
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
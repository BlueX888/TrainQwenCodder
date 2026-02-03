class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.bullets = null;
    this.cursors = null;
    this.fireCount = 0;
    this.lastFireTime = 0;
    this.fireDelay = 200; // 射击间隔（毫秒）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);
    playerGraphics.lineTo(-10, -10);
    playerGraphics.lineTo(-10, 10);
    playerGraphics.closePath();
    playerGraphics.fillPath();
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

    // 鼠标右键射击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.fireBullet();
      }
    });

    // 初始化信号
    window.__signals__ = {
      fireCount: 0,
      playerAngle: 0,
      activeBullets: 0,
      playerX: 400,
      playerY: 300
    };

    // 添加提示文本
    this.add.text(10, 10, 'Left/Right: Rotate\nRight Click: Fire', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 显示状态文本
    this.statusText = this.add.text(10, 60, '', {
      fontSize: '14px',
      fill: '#00ff00'
    });
  }

  update(time, delta) {
    // 旋转控制
    if (this.cursors.left.isDown) {
      this.player.angle -= 3;
    } else if (this.cursors.right.isDown) {
      this.player.angle += 3;
    }

    // 更新子弹，移除超出边界的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        if (bullet.x < -10 || bullet.x > 810 || bullet.y < -10 || bullet.y > 610) {
          this.bullets.killAndHide(bullet);
          bullet.body.enable = false;
        }
      }
    });

    // 更新信号
    window.__signals__.playerAngle = Math.round(this.player.angle);
    window.__signals__.activeBullets = this.bullets.countActive(true);
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.fireCount = this.fireCount;

    // 更新状态显示
    this.statusText.setText(
      `Fires: ${this.fireCount}\n` +
      `Angle: ${window.__signals__.playerAngle}°\n` +
      `Active Bullets: ${window.__signals__.activeBullets}`
    );

    // 输出日志（每秒一次）
    if (time % 1000 < 16) {
      console.log(JSON.stringify({
        timestamp: time,
        fireCount: this.fireCount,
        playerAngle: this.player.angle,
        activeBullets: this.bullets.countActive(true)
      }));
    }
  }

  fireBullet() {
    const currentTime = this.time.now;
    
    // 射击冷却检查
    if (currentTime - this.lastFireTime < this.fireDelay) {
      return;
    }

    // 获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;

      // 计算发射角度（Phaser 角度转弧度）
      const angleRad = Phaser.Math.DegToRad(this.player.angle);
      
      // 设置子弹速度（速度 120）
      const velocityX = Math.cos(angleRad) * 120;
      const velocityY = Math.sin(angleRad) * 120;
      
      bullet.setVelocity(velocityX, velocityY);
      bullet.setRotation(angleRad);

      // 更新统计
      this.fireCount++;
      this.lastFireTime = currentTime;

      // 输出射击日志
      console.log(JSON.stringify({
        action: 'fire',
        fireCount: this.fireCount,
        angle: Math.round(this.player.angle),
        position: { x: Math.round(this.player.x), y: Math.round(this.player.y) },
        velocity: { x: Math.round(velocityX), y: Math.round(velocityY) }
      }));
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
class ShootingScene extends Phaser.Scene {
  constructor() {
    super('ShootingScene');
    this.shotsFired = 0;
    this.playerAngle = 0;
  }

  preload() {
    // 创建玩家纹理（三角形表示方向）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);
    playerGraphics.lineTo(-10, -15);
    playerGraphics.lineTo(-10, 15);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆形）
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xff0000, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();
  }

  create() {
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

    // 鼠标输入
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.shootBullet();
      }
    });

    // 添加说明文本
    this.add.text(10, 10, 'Left/Right: Rotate\nLeft Click: Shoot', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 状态显示
    this.statusText = this.add.text(10, 80, '', {
      fontSize: '14px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化 signals
    window.__signals__ = {
      shotsFired: 0,
      activeBullets: 0,
      playerAngle: 0,
      playerX: 400,
      playerY: 300
    };

    console.log(JSON.stringify({
      event: 'game_started',
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 旋转控制
    const rotationSpeed = 3;
    if (this.cursors.left.isDown) {
      this.player.angle -= rotationSpeed;
      this.playerAngle = this.player.angle;
    } else if (this.cursors.right.isDown) {
      this.player.angle += rotationSpeed;
      this.playerAngle = this.player.angle;
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -50 || bullet.x > 850 || bullet.y < -50 || bullet.y > 650) {
          bullet.setActive(false);
          bullet.setVisible(false);
          this.physics.world.disable(bullet);
        }
      }
    });

    // 更新状态
    const activeBullets = this.bullets.countActive(true);
    this.statusText.setText(
      `Shots Fired: ${this.shotsFired}\n` +
      `Active Bullets: ${activeBullets}\n` +
      `Player Angle: ${Math.round(this.player.angle)}°`
    );

    // 更新 signals
    window.__signals__.shotsFired = this.shotsFired;
    window.__signals__.activeBullets = activeBullets;
    window.__signals__.playerAngle = Math.round(this.player.angle);
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
  }

  shootBullet() {
    // 获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      this.physics.world.enable(bullet);

      // 计算发射角度（Phaser 角度转弧度）
      const angleInRadians = Phaser.Math.DegToRad(this.player.angle);
      
      // 设置子弹速度（向玩家朝向发射）
      const bulletSpeed = 300;
      const velocityX = Math.cos(angleInRadians) * bulletSpeed;
      const velocityY = Math.sin(angleInRadians) * bulletSpeed;
      
      bullet.setVelocity(velocityX, velocityY);
      bullet.setRotation(angleInRadians);

      // 更新统计
      this.shotsFired++;

      // 输出射击事件
      console.log(JSON.stringify({
        event: 'bullet_fired',
        shotNumber: this.shotsFired,
        angle: Math.round(this.player.angle),
        position: {
          x: Math.round(this.player.x),
          y: Math.round(this.player.y)
        },
        velocity: {
          x: Math.round(velocityX),
          y: Math.round(velocityY)
        },
        timestamp: Date.now()
      }));
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
  scene: ShootingScene
};

new Phaser.Game(config);
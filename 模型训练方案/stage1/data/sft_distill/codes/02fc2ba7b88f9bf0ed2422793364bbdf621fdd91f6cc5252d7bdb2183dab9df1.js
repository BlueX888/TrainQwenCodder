class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shotsFired = 0;
    this.activeBullets = 0;
  }

  preload() {
    // 创建玩家纹理（三角形表示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);  // 尖端朝右
    playerGraphics.lineTo(-10, -15);
    playerGraphics.lineTo(-10, 15);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xff0000, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();
  }

  create() {
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

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 空格键发射冷却
    this.canShoot = true;
    this.shootCooldown = 250; // 毫秒

    // 添加说明文本
    this.add.text(10, 10, 'Arrow Keys: Rotate\nSpace: Shoot', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 状态显示
    this.statsText = this.add.text(10, 550, '', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    // 初始化可验证信号
    window.__signals__ = {
      shotsFired: 0,
      activeBullets: 0,
      playerAngle: 0,
      playerX: 400,
      playerY: 300
    };
  }

  update(time, delta) {
    // 旋转控制
    const rotationSpeed = 3; // 度/帧
    if (this.cursors.left.isDown) {
      this.player.angle -= rotationSpeed;
    }
    if (this.cursors.right.isDown) {
      this.player.angle += rotationSpeed;
    }

    // 上下键也可以用来旋转（备选方案）
    if (this.cursors.up.isDown) {
      this.player.angle -= rotationSpeed;
    }
    if (this.cursors.down.isDown) {
      this.player.angle += rotationSpeed;
    }

    // 发射子弹
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canShoot) {
      this.shootBullet();
      this.canShoot = false;
      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -50 || bullet.x > 850 || bullet.y < -50 || bullet.y > 650) {
          bullet.setActive(false);
          bullet.setVisible(false);
          this.activeBullets--;
        }
      }
    });

    // 更新统计信息
    this.activeBullets = this.bullets.countActive(true);
    this.statsText.setText(
      `Shots Fired: ${this.shotsFired} | Active Bullets: ${this.activeBullets}`
    );

    // 更新可验证信号
    window.__signals__.shotsFired = this.shotsFired;
    window.__signals__.activeBullets = this.activeBullets;
    window.__signals__.playerAngle = Math.round(this.player.angle);
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
  }

  shootBullet() {
    // 获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 计算子弹速度（基于玩家角度）
      const bulletSpeed = 300;
      const angleInRadians = Phaser.Math.DegToRad(this.player.angle);
      
      // 使用 velocityFromAngle 计算速度向量
      const velocity = this.physics.velocityFromAngle(
        this.player.angle,
        bulletSpeed
      );
      
      bullet.setVelocity(velocity.x, velocity.y);
      bullet.setRotation(angleInRadians);
      
      // 设置子弹从玩家前方发射（偏移位置）
      const offsetDistance = 25;
      bullet.x = this.player.x + Math.cos(angleInRadians) * offsetDistance;
      bullet.y = this.player.y + Math.sin(angleInRadians) * offsetDistance;
      
      this.shotsFired++;
      this.activeBullets++;
      
      // 输出射击日志
      console.log(JSON.stringify({
        event: 'shot_fired',
        shotNumber: this.shotsFired,
        angle: Math.round(this.player.angle),
        position: {
          x: Math.round(bullet.x),
          y: Math.round(bullet.y)
        },
        velocity: {
          x: Math.round(velocity.x),
          y: Math.round(velocity.y)
        }
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
  scene: GameScene
};

const game = new Phaser.Game(config);
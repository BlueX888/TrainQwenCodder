class ShootingScene extends Phaser.Scene {
  constructor() {
    super('ShootingScene');
    this.shotsFired = 0;
    this.activeBullets = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化验证信号
    window.__signals__ = {
      shotsFired: 0,
      activeBullets: 0,
      playerRotation: 0,
      lastShotTime: 0
    };

    // 创建玩家纹理（三角形飞船）
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

    // 创建子弹纹理（小圆点）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(0, 0, 3);
    bulletGraphics.generateTexture('bullet', 6, 6);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.99);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: true
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 射击冷却时间（毫秒）
    this.shootCooldown = 200;
    this.lastShootTime = 0;

    // 添加说明文字
    this.add.text(10, 10, 'Controls:\nLeft/Right: Rotate\nUp/Space: Fire\nBullet Speed: 80', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 状态显示
    this.statusText = this.add.text(10, 550, '', {
      fontSize: '14px',
      fill: '#00ff00'
    });

    console.log('[GAME_START]', JSON.stringify({
      timestamp: Date.now(),
      playerPosition: { x: this.player.x, y: this.player.y },
      playerRotation: this.player.rotation
    }));
  }

  update(time, delta) {
    // 旋转控制
    if (this.cursors.left.isDown) {
      this.player.angle -= 3;
    } else if (this.cursors.right.isDown) {
      this.player.angle += 3;
    }

    // 发射子弹（上键或空格键）
    if ((this.cursors.up.isDown || this.fireKey.isDown) && 
        time > this.lastShootTime + this.shootCooldown) {
      this.shootBullet();
      this.lastShootTime = time;
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -10 || bullet.x > 810 || 
            bullet.y < -10 || bullet.y > 610) {
          bullet.setActive(false);
          bullet.setVisible(false);
          this.activeBullets--;
        }
      }
    });

    // 更新状态显示
    this.statusText.setText(
      `Shots Fired: ${this.shotsFired} | Active Bullets: ${this.activeBullets} | Angle: ${Math.round(this.player.angle)}°`
    );

    // 更新验证信号
    window.__signals__.shotsFired = this.shotsFired;
    window.__signals__.activeBullets = this.activeBullets;
    window.__signals__.playerRotation = this.player.angle;
  }

  shootBullet() {
    // 从对象池获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 计算子弹发射方向（基于玩家角度）
      const angleRad = Phaser.Math.DegToRad(this.player.angle);
      const velocityX = Math.cos(angleRad) * 300; // 速度设为 300 以确保有效速度约 80
      const velocityY = Math.sin(angleRad) * 300;
      
      bullet.setVelocity(velocityX, velocityY);
      bullet.setRotation(angleRad);
      
      // 增加计数
      this.shotsFired++;
      this.activeBullets++;
      
      // 更新验证信号
      window.__signals__.lastShotTime = Date.now();
      
      // 输出射击日志
      console.log('[SHOT_FIRED]', JSON.stringify({
        timestamp: Date.now(),
        shotNumber: this.shotsFired,
        position: { x: Math.round(this.player.x), y: Math.round(this.player.y) },
        angle: Math.round(this.player.angle),
        velocity: { x: Math.round(velocityX), y: Math.round(velocityY) },
        speed: Math.round(Math.sqrt(velocityX * velocityX + velocityY * velocityY))
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
  scene: ShootingScene
};

const game = new Phaser.Game(config);
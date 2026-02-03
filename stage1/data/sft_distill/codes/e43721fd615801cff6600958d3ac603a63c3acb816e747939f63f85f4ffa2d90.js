class ShootingScene extends Phaser.Scene {
  constructor() {
    super('ShootingScene');
    this.player = null;
    this.bullets = null;
    this.cursors = null;
    this.spaceKey = null;
    this.lastFired = 0;
    this.fireRate = 250; // 发射间隔（毫秒）
    
    // 可验证的状态信号
    this.signals = {
      bulletsFired: 0,
      playerAngle: 0,
      activeBullets: 0,
      timestamp: Date.now()
    };
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建玩家纹理（三角形表示方向）
    this.createPlayerTexture();
    
    // 创建子弹纹理（圆形）
    this.createBulletTexture();
    
    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.99);
    
    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bulletTex',
      maxSize: 50,
      runChildUpdate: true
    });
    
    // 设置输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 添加说明文字
    this.add.text(10, 10, 'Arrow Keys: Rotate\nSpace: Shoot', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });
    
    // 添加状态显示
    this.statsText = this.add.text(10, 80, '', {
      fontSize: '14px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 暴露信号到全局
    window.__signals__ = this.signals;
    
    console.log('[GAME_INIT]', JSON.stringify({
      scene: 'ShootingScene',
      playerPos: { x: 400, y: 300 },
      fireRate: this.fireRate
    }));
  }

  createPlayerTexture() {
    const graphics = this.add.graphics();
    
    // 绘制三角形玩家（指向上方）
    graphics.fillStyle(0x00ff00, 1);
    graphics.beginPath();
    graphics.moveTo(16, 0);      // 顶点
    graphics.lineTo(0, 32);      // 左下
    graphics.lineTo(32, 32);     // 右下
    graphics.closePath();
    graphics.fillPath();
    
    // 添加边框
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokePath();
    
    graphics.generateTexture('playerTex', 32, 32);
    graphics.destroy();
  }

  createBulletTexture() {
    const graphics = this.add.graphics();
    
    // 绘制圆形子弹
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(4, 4, 4);
    
    graphics.generateTexture('bulletTex', 8, 8);
    graphics.destroy();
  }

  update(time, delta) {
    // 玩家旋转控制
    if (this.cursors.left.isDown) {
      this.player.angle -= 3;
    } else if (this.cursors.right.isDown) {
      this.player.angle += 3;
    }
    
    // 发射子弹
    if (this.spaceKey.isDown && time > this.lastFired + this.fireRate) {
      this.fireBullet();
      this.lastFired = time;
    }
    
    // 更新子弹状态
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        // 检查子弹是否超出边界
        if (bullet.x < -20 || bullet.x > 820 || 
            bullet.y < -20 || bullet.y > 620) {
          bullet.setActive(false);
          bullet.setVisible(false);
          this.signals.activeBullets--;
        }
      }
    });
    
    // 更新信号
    this.signals.playerAngle = Math.round(this.player.angle);
    this.signals.timestamp = Date.now();
    
    // 更新状态显示
    this.statsText.setText(
      `Bullets Fired: ${this.signals.bulletsFired}\n` +
      `Active Bullets: ${this.signals.activeBullets}\n` +
      `Player Angle: ${this.signals.playerAngle}°`
    );
  }

  fireBullet() {
    // 获取或创建子弹
    let bullet = this.bullets.get();
    
    if (!bullet) {
      return;
    }
    
    // 设置子弹初始位置（玩家中心）
    bullet.setPosition(this.player.x, this.player.y);
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 计算发射方向（Phaser 角度是顺时针，0度指向右）
    // 玩家纹理默认朝上，所以需要减90度
    const angleInRadians = Phaser.Math.DegToRad(this.player.angle - 90);
    
    // 设置子弹速度
    const bulletSpeed = 300;
    const velocityX = Math.cos(angleInRadians) * bulletSpeed;
    const velocityY = Math.sin(angleInRadians) * bulletSpeed;
    
    bullet.setVelocity(velocityX, velocityY);
    bullet.setRotation(angleInRadians);
    
    // 更新信号
    this.signals.bulletsFired++;
    this.signals.activeBullets++;
    
    // 输出日志
    console.log('[BULLET_FIRED]', JSON.stringify({
      bulletId: this.signals.bulletsFired,
      position: { x: Math.round(bullet.x), y: Math.round(bullet.y) },
      velocity: { x: Math.round(velocityX), y: Math.round(velocityY) },
      angle: Math.round(this.player.angle),
      timestamp: Date.now()
    }));
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: ShootingScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 初始化全局信号对象
window.__signals__ = {
  bulletsFired: 0,
  playerAngle: 0,
  activeBullets: 0,
  timestamp: Date.now()
};
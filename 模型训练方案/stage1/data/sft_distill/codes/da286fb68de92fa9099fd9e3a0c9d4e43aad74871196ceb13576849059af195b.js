// 多方向射击游戏
class ShootingScene extends Phaser.Scene {
  constructor() {
    super('ShootingScene');
    this.player = null;
    this.bullets = null;
    this.cursors = null;
    this.spaceKey = null;
    this.rotationSpeed = 3; // 每秒旋转度数
    this.bulletSpeed = 300;
    
    // 可验证信号
    this.signals = {
      shotsFired: 0,
      activeBullets: 0,
      playerRotation: 0,
      lastShotTime: 0
    };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（三角形表示方向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0); // 尖端朝右
    playerGraphics.lineTo(-15, -12);
    playerGraphics.lineTo(-15, 12);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
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

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加说明文本
    this.add.text(10, 10, 'Arrow Keys: Rotate\nSpace: Shoot', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加信号显示
    this.signalText = this.add.text(10, 550, '', {
      fontSize: '14px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });

    // 暴露信号到全局
    window.__signals__ = this.signals;

    // 添加背景网格便于观察
    this.createGrid();
  }

  createGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);
    
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }
  }

  update(time, delta) {
    // 处理玩家旋转
    if (this.cursors.left.isDown) {
      this.player.angle -= this.rotationSpeed;
    } else if (this.cursors.right.isDown) {
      this.player.angle += this.rotationSpeed;
    }

    // 处理射击（防止连续按住）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.shootBullet();
    }

    // 更新子弹，移除超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -50 || bullet.x > 850 || bullet.y < -50 || bullet.y > 650) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });

    // 更新信号
    this.updateSignals(time);
  }

  shootBullet() {
    // 获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 计算发射角度（Phaser 角度是顺时针，0度朝右）
      const angleInRadians = Phaser.Math.DegToRad(this.player.angle);
      
      // 根据角度计算速度分量
      const velocityX = Math.cos(angleInRadians) * this.bulletSpeed;
      const velocityY = Math.sin(angleInRadians) * this.bulletSpeed;
      
      // 设置子弹速度
      bullet.setVelocity(velocityX, velocityY);
      
      // 设置子弹角度与玩家一致（视觉效果）
      bullet.angle = this.player.angle;
      
      // 更新信号
      this.signals.shotsFired++;
      this.signals.lastShotTime = Date.now();
      
      // 输出日志
      console.log(JSON.stringify({
        event: 'bullet_fired',
        shotNumber: this.signals.shotsFired,
        angle: this.player.angle,
        position: { x: this.player.x, y: this.player.y },
        velocity: { x: velocityX, y: velocityY }
      }));
    }
  }

  updateSignals(time) {
    // 统计活跃子弹数
    this.signals.activeBullets = this.bullets.countActive(true);
    this.signals.playerRotation = Math.round(this.player.angle);
    
    // 更新显示文本
    this.signalText.setText([
      `Shots Fired: ${this.signals.shotsFired}`,
      `Active Bullets: ${this.signals.activeBullets}`,
      `Player Rotation: ${this.signals.playerRotation}°`
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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
  shotsFired: 0,
  activeBullets: 0,
  playerRotation: 0,
  lastShotTime: 0
};
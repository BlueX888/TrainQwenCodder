class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.bullets = null;
    this.cursors = null;
    this.rotationSpeed = 3; // 每秒旋转角度
    this.bulletSpeed = 120;
    this.bulletsFired = 0;
    this.activeBullets = 0;
  }

  preload() {
    // 创建玩家纹理（三角形表示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);  // 尖端指向右侧
    playerGraphics.lineTo(-10, -10);
    playerGraphics.lineTo(-10, 10);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xff0000, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.angle = 0; // 初始朝向右侧

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: true
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 鼠标右键输入
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.shootBullet();
      }
    });

    // 添加说明文字
    this.add.text(10, 10, 'Left/Right: Rotate\nRight Click: Shoot', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 初始化 signals
    window.__signals__ = {
      bulletsFired: 0,
      activeBullets: 0,
      playerAngle: 0,
      playerPosition: { x: 400, y: 300 }
    };

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now(),
      playerPosition: { x: 400, y: 300 }
    }));
  }

  update(time, delta) {
    // 玩家旋转
    if (this.cursors.left.isDown) {
      this.player.angle -= this.rotationSpeed * (delta / 1000) * 60;
    } else if (this.cursors.right.isDown) {
      this.player.angle += this.rotationSpeed * (delta / 1000) * 60;
    }

    // 更新子弹状态
    this.activeBullets = this.bullets.getChildren().filter(b => b.active).length;

    // 检查子弹是否超出边界
    this.bullets.children.each((bullet) => {
      if (bullet.active) {
        if (bullet.x < -10 || bullet.x > 810 || bullet.y < -10 || bullet.y > 610) {
          bullet.setActive(false);
          bullet.setVisible(false);
          console.log(JSON.stringify({
            event: 'bullet_destroyed',
            timestamp: Date.now(),
            position: { x: Math.round(bullet.x), y: Math.round(bullet.y) }
          }));
        }
      }
    });

    // 更新 signals
    window.__signals__.playerAngle = Math.round(this.player.angle);
    window.__signals__.bulletsFired = this.bulletsFired;
    window.__signals__.activeBullets = this.activeBullets;
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
  }

  shootBullet() {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 根据玩家角度设置子弹速度
      // Phaser 的角度是顺时针，0度指向右侧
      const velocity = this.physics.velocityFromAngle(
        this.player.angle,
        this.bulletSpeed
      );
      
      bullet.setVelocity(velocity.x, velocity.y);
      bullet.angle = this.player.angle;
      
      this.bulletsFired++;
      
      console.log(JSON.stringify({
        event: 'bullet_fired',
        timestamp: Date.now(),
        bulletId: this.bulletsFired,
        angle: Math.round(this.player.angle),
        position: { x: Math.round(this.player.x), y: Math.round(this.player.y) },
        velocity: { x: Math.round(velocity.x), y: Math.round(velocity.y) }
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

new Phaser.Game(config);
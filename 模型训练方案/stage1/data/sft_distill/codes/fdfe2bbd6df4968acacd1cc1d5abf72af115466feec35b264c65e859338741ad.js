class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0;
    this.activeBullets = 0;
  }

  preload() {
    // 无需加载外部资源
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
      runChildUpdate: false
    });

    // 键盘输入（旋转）
    this.cursors = this.input.keyboard.createCursorKeys();

    // 鼠标右键输入（发射子弹）
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.fireBullet();
      }
    });

    // 添加提示文字
    this.add.text(10, 10, '左右键旋转，右键发射', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 初始化信号对象
    window.__signals__ = {
      bulletsFired: 0,
      activeBullets: 0,
      playerRotation: 0
    };

    // 输出初始状态
    console.log(JSON.stringify({
      event: 'game_start',
      playerX: this.player.x,
      playerY: this.player.y,
      playerRotation: this.player.rotation
    }));
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

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        if (bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 600) {
          bullet.setActive(false);
          bullet.setVisible(false);
          this.activeBullets--;
        }
      }
    });

    // 更新信号
    window.__signals__.activeBullets = this.activeBullets;
    window.__signals__.playerRotation = this.player.rotation;
  }

  fireBullet() {
    // 从对象池获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 计算子弹速度（基于玩家朝向）
      const angleRad = Phaser.Math.DegToRad(this.player.angle);
      const velocityX = Math.cos(angleRad) * 120;
      const velocityY = Math.sin(angleRad) * 120;

      bullet.setVelocity(velocityX, velocityY);
      bullet.setRotation(angleRad);

      // 更新统计
      this.bulletsFired++;
      this.activeBullets++;
      window.__signals__.bulletsFired = this.bulletsFired;
      window.__signals__.activeBullets = this.activeBullets;

      // 输出发射事件
      console.log(JSON.stringify({
        event: 'bullet_fired',
        bulletsFired: this.bulletsFired,
        activeBullets: this.activeBullets,
        playerAngle: this.player.angle,
        velocityX: velocityX,
        velocityY: velocityY,
        timestamp: time
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
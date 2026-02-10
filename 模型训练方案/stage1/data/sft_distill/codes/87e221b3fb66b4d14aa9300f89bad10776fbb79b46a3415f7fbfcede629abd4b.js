class ShootingScene extends Phaser.Scene {
  constructor() {
    super('ShootingScene');
    this.bulletsFired = 0;
    this.activeBullets = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（三角形，指向右侧）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);   // 尖端
    playerGraphics.lineTo(-10, -10); // 左下
    playerGraphics.lineTo(-10, 10);  // 右下
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

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 鼠标射击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.shootBullet();
      }
    });

    // 添加提示文本
    this.add.text(10, 10, 'Use Arrow Keys to Rotate\nLeft Click to Shoot', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 状态显示文本
    this.statsText = this.add.text(10, 550, '', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    // 初始化可验证信号
    window.__signals__ = {
      bulletsFired: 0,
      activeBullets: 0,
      playerAngle: 0
    };

    // 定期输出日志
    this.time.addEvent({
      delay: 1000,
      callback: this.logState,
      callbackScope: this,
      loop: true
    });
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

    // 清理越界子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        if (bullet.x < -20 || bullet.x > 820 || bullet.y < -20 || bullet.y > 620) {
          this.bullets.killAndHide(bullet);
          this.activeBullets--;
        }
      }
    });

    // 更新状态显示
    this.statsText.setText(
      `Bullets Fired: ${this.bulletsFired} | Active: ${this.activeBullets} | Angle: ${Math.round(this.player.angle)}°`
    );

    // 更新可验证信号
    window.__signals__.bulletsFired = this.bulletsFired;
    window.__signals__.activeBullets = this.activeBullets;
    window.__signals__.playerAngle = Math.round(this.player.angle);
  }

  shootBullet() {
    // 获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (!bullet) {
      return; // 子弹池已满
    }

    bullet.setActive(true);
    bullet.setVisible(true);

    // 计算子弹速度方向（根据玩家角度）
    const bulletSpeed = 400;
    const angleInRadians = Phaser.Math.DegToRad(this.player.angle);
    
    // 使用 velocityFromRotation 根据角度设置速度
    this.physics.velocityFromRotation(
      angleInRadians,
      bulletSpeed,
      bullet.body.velocity
    );

    // 设置子弹角度与玩家一致
    bullet.setAngle(this.player.angle);

    // 更新统计
    this.bulletsFired++;
    this.activeBullets++;

    // 设置子弹生命周期（3秒后自动销毁）
    this.time.delayedCall(3000, () => {
      if (bullet.active) {
        this.bullets.killAndHide(bullet);
        this.activeBullets--;
      }
    });
  }

  logState() {
    // 输出 JSON 格式的状态日志
    const state = {
      timestamp: Date.now(),
      bulletsFired: this.bulletsFired,
      activeBullets: this.activeBullets,
      playerAngle: Math.round(this.player.angle),
      playerPosition: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y)
      }
    };
    console.log('GAME_STATE:', JSON.stringify(state));
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
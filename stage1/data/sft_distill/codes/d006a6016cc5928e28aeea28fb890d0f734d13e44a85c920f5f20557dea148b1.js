class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 状态信号：发射的子弹总数
    this.activeBullets = 0; // 状态信号：当前活跃的子弹数
  }

  preload() {
    // 不需要加载外部资源
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

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 射击冷却时间
    this.lastFired = 0;
    this.fireRate = 200; // 200ms冷却

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加说明文本
    this.add.text(10, 550, 'Arrow Keys: Rotate | Space: Shoot', {
      fontSize: '14px',
      fill: '#cccccc'
    });
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

    // 射击控制
    if (this.spaceKey.isDown && time > this.lastFired + this.fireRate) {
      this.shoot();
      this.lastFired = time;
    }

    // 更新子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        // 边界检测，超出边界则销毁子弹
        if (bullet.x < -10 || bullet.x > 810 || bullet.y < -10 || bullet.y > 610) {
          bullet.setActive(false);
          bullet.setVisible(false);
          this.activeBullets--;
        }
      }
    });

    // 更新状态文本
    this.statusText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.activeBullets}`,
      `Player Angle: ${Math.round(this.player.angle)}°`
    ]);
  }

  shoot() {
    // 获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 计算子弹发射角度（玩家角度转弧度）
      const angleRad = Phaser.Math.DegToRad(this.player.angle);
      
      // 根据角度计算速度分量
      const bulletSpeed = 300;
      const velocityX = Math.cos(angleRad) * bulletSpeed;
      const velocityY = Math.sin(angleRad) * bulletSpeed;
      
      // 设置子弹速度
      bullet.setVelocity(velocityX, velocityY);
      
      // 设置子弹角度（可选，让子弹也旋转）
      bullet.setRotation(angleRad);
      
      // 更新统计
      this.bulletsFired++;
      this.activeBullets++;
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
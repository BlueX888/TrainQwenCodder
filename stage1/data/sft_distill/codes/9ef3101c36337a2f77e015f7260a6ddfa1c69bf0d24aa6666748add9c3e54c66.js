class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 状态信号：发射子弹数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（三角形指示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);  // 顶点（朝向）
    playerGraphics.lineTo(-10, -10);
    playerGraphics.lineTo(-10, 10);
    playerGraphics.closePath();
    playerGraphics.fill();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆点）
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
      maxSize: 50
    });

    // 设置键盘输入
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 射击冷却时间
    this.lastFireTime = 0;
    this.fireRate = 200; // 毫秒

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加说明文字
    this.add.text(10, 550, 'Controls: A/D - Rotate, W - Shoot', {
      fontSize: '14px',
      fill: '#cccccc'
    });
  }

  update(time, delta) {
    // 旋转控制
    if (this.keys.A.isDown) {
      this.player.angle -= 3; // 逆时针旋转
    }
    if (this.keys.D.isDown) {
      this.player.angle += 3; // 顺时针旋转
    }

    // 射击控制
    if (this.keys.W.isDown && time > this.lastFireTime + this.fireRate) {
      this.shootBullet();
      this.lastFireTime = time;
    }

    // 移除超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -50 || bullet.x > 850 || 
            bullet.y < -50 || bullet.y > 650) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.bullets.countActive(true)}`,
      `Player Angle: ${Math.round(this.player.angle)}°`
    ]);
  }

  shootBullet() {
    // 获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹位置（从玩家前方发射）
      const offsetX = Math.cos((this.player.angle - 90) * Math.PI / 180) * 20;
      const offsetY = Math.sin((this.player.angle - 90) * Math.PI / 180) * 20;
      bullet.setPosition(this.player.x + offsetX, this.player.y + offsetY);
      
      // 根据玩家角度计算子弹速度
      // Phaser中0度是向右，但我们的三角形默认向上，所以减90度
      const angleInRadians = (this.player.angle - 90) * Math.PI / 180;
      const velocityX = Math.cos(angleInRadians) * 360;
      const velocityY = Math.sin(angleInRadians) * 360;
      
      bullet.setVelocity(velocityX, velocityY);
      
      // 增加发射计数
      this.bulletsFired++;
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
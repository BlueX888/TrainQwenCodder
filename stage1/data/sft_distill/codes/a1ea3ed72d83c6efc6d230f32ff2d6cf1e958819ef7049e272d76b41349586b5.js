class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shotsFired = 0; // 状态信号：已发射子弹数
    this.lastFireTime = 0;
    this.fireDelay = 250; // 射击间隔（毫秒）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（三角形表示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0); // 尖端指向右侧
    playerGraphics.lineTo(-15, -12);
    playerGraphics.lineTo(-15, 12);
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
    this.player.setDamping(true);
    this.player.setDrag(0.95);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: false
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加说明文本
    this.add.text(10, 550, '方向键：旋转  空格：射击', {
      fontSize: '14px',
      fill: '#aaaaaa'
    });

    this.updateStatusText();
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

    // 射击控制（带冷却时间）
    if (this.spaceKey.isDown && time > this.lastFireTime + this.fireDelay) {
      this.fireBullet();
      this.lastFireTime = time;
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -20 || bullet.x > 820 || 
            bullet.y < -20 || bullet.y > 620) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });

    this.updateStatusText();
  }

  fireBullet() {
    // 获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 计算子弹发射角度（玩家角度转换为弧度）
      const angleRad = Phaser.Math.DegToRad(this.player.angle);
      
      // 根据角度计算速度分量
      const bulletSpeed = 300;
      const velocityX = Math.cos(angleRad) * bulletSpeed;
      const velocityY = Math.sin(angleRad) * bulletSpeed;

      // 设置子弹位置（从玩家前方发射）
      const offsetDistance = 25;
      bullet.x = this.player.x + Math.cos(angleRad) * offsetDistance;
      bullet.y = this.player.y + Math.sin(angleRad) * offsetDistance;

      // 设置子弹速度
      bullet.setVelocity(velocityX, velocityY);
      bullet.setRotation(angleRad);

      // 增加射击计数
      this.shotsFired++;
    }
  }

  updateStatusText() {
    this.statusText.setText([
      `射击次数: ${this.shotsFired}`,
      `玩家角度: ${Math.round(this.player.angle)}°`,
      `活跃子弹: ${this.bullets.countActive(true)}`
    ]);
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
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 状态信号：已发射子弹数量
    this.lastFireTime = 0; // 射击冷却时间
    this.fireRate = 300; // 射击间隔（毫秒）
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
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
      runChildUpdate: true
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(10, 550, '方向键：旋转  空格键：射击', {
      fontSize: '14px',
      fill: '#ffffff'
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 旋转控制
    const rotationSpeed = 3; // 旋转速度（度/帧）
    
    if (this.cursors.left.isDown) {
      this.player.angle -= rotationSpeed;
    }
    if (this.cursors.right.isDown) {
      this.player.angle += rotationSpeed;
    }

    // 射击控制（带冷却时间）
    if (this.spaceKey.isDown && time > this.lastFireTime + this.fireRate) {
      this.fireBullet();
      this.lastFireTime = time;
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -50 || bullet.x > 850 || bullet.y < -50 || bullet.y > 650) {
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
      
      // 设置子弹角度与玩家一致
      bullet.rotation = this.player.rotation;
      
      // 根据玩家角度计算子弹速度
      // Phaser 的角度是弧度制，0度朝右
      const bulletSpeed = 200;
      const angleInDegrees = this.player.angle;
      
      // 使用 velocityFromAngle 计算速度向量
      const velocity = this.physics.velocityFromAngle(angleInDegrees, bulletSpeed);
      bullet.setVelocity(velocity.x, velocity.y);
      
      // 增加发射计数
      this.bulletsFired++;
    }
  }

  updateStatusText() {
    const activeBullets = this.bullets.countActive(true);
    this.statusText.setText(
      `子弹发射数: ${this.bulletsFired}\n` +
      `当前子弹数: ${activeBullets}\n` +
      `玩家角度: ${Math.round(this.player.angle)}°`
    );
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
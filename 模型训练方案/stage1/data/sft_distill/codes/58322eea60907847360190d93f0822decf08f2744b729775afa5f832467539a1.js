class ShootingGame extends Phaser.Scene {
  constructor() {
    super('ShootingGame');
    this.bulletsFired = 0; // 状态信号：发射的子弹总数
    this.activeBullets = 0; // 状态信号：当前活跃子弹数
  }

  preload() {
    // 创建玩家纹理（三角形）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);
    playerGraphics.lineTo(-10, -10);
    playerGraphics.lineTo(-10, 10);
    playerGraphics.closePath();
    playerGraphics.fill();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆形）
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: true
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 鼠标右键监听
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.fireBullet();
      }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(10, 550, '左右箭头：旋转玩家 | 鼠标右键：发射子弹', {
      fontSize: '14px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // 旋转控制
    if (this.cursors.left.isDown) {
      this.player.angle -= 3;
    } else if (this.cursors.right.isDown) {
      this.player.angle += 3;
    }

    // 更新子弹，移除越界子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        if (bullet.x < -50 || bullet.x > 850 || bullet.y < -50 || bullet.y > 650) {
          this.bullets.killAndHide(bullet);
          bullet.body.enable = false;
          this.activeBullets--;
        }
      }
    });

    // 更新状态显示
    this.statusText.setText(
      `总发射数: ${this.bulletsFired}\n` +
      `活跃子弹: ${this.activeBullets}\n` +
      `玩家角度: ${Math.round(this.player.angle)}°`
    );
  }

  fireBullet() {
    // 获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;

      // 设置子弹角度与玩家一致
      bullet.angle = this.player.angle;

      // 根据玩家角度计算速度向量
      const velocity = this.physics.velocityFromAngle(
        this.player.angle,
        240
      );

      bullet.setVelocity(velocity.x, velocity.y);

      // 更新状态
      this.bulletsFired++;
      this.activeBullets++;

      // 添加子弹生命周期（可选，防止子弹永久存在）
      this.time.delayedCall(5000, () => {
        if (bullet.active) {
          this.bullets.killAndHide(bullet);
          bullet.body.enable = false;
          this.activeBullets--;
        }
      });
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
  scene: ShootingGame
};

new Phaser.Game(config);
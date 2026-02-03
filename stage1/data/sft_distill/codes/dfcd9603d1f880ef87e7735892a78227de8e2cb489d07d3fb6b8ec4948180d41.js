class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 状态信号：发射的子弹总数
    this.activeBullets = 0; // 状态信号：当前活跃子弹数
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 生成玩家纹理（三角形飞船）
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

    // 生成子弹纹理（小圆形）
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
    this.player.setMaxVelocity(200);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: true
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 控制射击间隔
    this.lastFired = 0;
    this.fireRate = 200; // 毫秒

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加说明文字
    this.add.text(10, 550, '方向键：旋转  空格键：发射', {
      fontSize: '14px',
      fill: '#aaaaaa'
    });
  }

  update(time, delta) {
    // 玩家旋转控制
    const rotationSpeed = 3;
    if (this.cursors.left.isDown) {
      this.player.angle -= rotationSpeed;
    }
    if (this.cursors.right.isDown) {
      this.player.angle += rotationSpeed;
    }

    // 发射子弹
    if (this.spaceKey.isDown && time > this.lastFired + this.fireRate) {
      this.fireBullet();
      this.lastFired = time;
    }

    // 更新子弹（检查边界）
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        // 子弹超出边界时回收
        if (bullet.x < -20 || bullet.x > 820 || bullet.y < -20 || bullet.y > 620) {
          bullet.setActive(false);
          bullet.setVisible(false);
          this.activeBullets--;
        }
      }
    });

    // 更新状态显示
    this.statusText.setText(
      `子弹发射总数: ${this.bulletsFired}\n` +
      `当前活跃子弹: ${this.activeBullets}\n` +
      `玩家角度: ${Math.round(this.player.angle)}°`
    );
  }

  fireBullet() {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹角度与玩家一致
      bullet.setRotation(this.player.rotation);
      
      // 根据玩家角度计算子弹速度
      const angleInRadians = Phaser.Math.DegToRad(this.player.angle);
      const velocityX = Math.cos(angleInRadians) * 400;
      const velocityY = Math.sin(angleInRadians) * 400;
      
      bullet.setVelocity(velocityX, velocityY);
      
      // 更新状态
      this.bulletsFired++;
      this.activeBullets++;
      
      // 设置子弹生命周期（3秒后自动销毁）
      this.time.delayedCall(3000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
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
  backgroundColor: '#000000',
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
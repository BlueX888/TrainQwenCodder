class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 状态信号：发射的子弹数
    this.rotationSpeed = 3; // 旋转速度（度/帧）
  }

  preload() {
    // 创建玩家纹理（三角形表示方向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0); // 尖端指向右侧
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
  }

  create() {
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
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    // 射击冷却时间（毫秒）
    this.shootCooldown = 200;
    this.lastShootTime = 0;

    // 显示状态信息
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示控制说明
    this.add.text(10, 550, 'Controls: WASD to shoot | Arrow Keys to rotate', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 更新状态显示
    this.statsText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Player Angle: ${Math.round(this.player.angle)}°`,
      `Active Bullets: ${this.bullets.getLength()}`
    ]);

    // 处理玩家旋转
    if (this.keyLeft.isDown) {
      this.player.angle -= this.rotationSpeed;
    }
    if (this.keyRight.isDown) {
      this.player.angle += this.rotationSpeed;
    }

    // 处理射击
    const canShoot = time > this.lastShootTime + this.shootCooldown;
    
    if (canShoot) {
      if (this.keyW.isDown) {
        this.shootBullet();
        this.lastShootTime = time;
      } else if (this.keyA.isDown) {
        this.shootBullet();
        this.lastShootTime = time;
      } else if (this.keyS.isDown) {
        this.shootBullet();
        this.lastShootTime = time;
      } else if (this.keyD.isDown) {
        this.shootBullet();
        this.lastShootTime = time;
      }
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -10 || bullet.x > 810 || 
            bullet.y < -10 || bullet.y > 610) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });
  }

  shootBullet() {
    // 从对象池获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹角度与玩家一致
      bullet.rotation = this.player.rotation;
      
      // 计算子弹速度（根据玩家朝向）
      // Phaser中角度0度指向右侧，顺时针增加
      const bulletSpeed = 360;
      const angleInRadians = Phaser.Math.DegToRad(this.player.angle);
      
      // 使用三角函数计算速度分量
      const velocityX = Math.cos(angleInRadians) * bulletSpeed;
      const velocityY = Math.sin(angleInRadians) * bulletSpeed;
      
      bullet.setVelocity(velocityX, velocityY);
      
      // 增加发射计数
      this.bulletsFired++;
      
      // 子弹生命周期（3秒后自动销毁）
      this.time.delayedCall(3000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
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
  scene: GameScene
};

new Phaser.Game(config);
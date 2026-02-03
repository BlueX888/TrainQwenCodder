class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 状态信号：子弹发射计数
    this.lastFireTime = 0; // 射击冷却时间
    this.fireRate = 200; // 射击间隔（毫秒）
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 15, 15, 15); // 三角形指向上方
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 添加UI显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加操作说明
    this.add.text(10, 550, 'Arrow Keys: Rotate | WASD: Shoot', {
      fontSize: '14px',
      fill: '#cccccc'
    });
  }

  update(time, delta) {
    // 旋转控制
    if (this.cursors.left.isDown) {
      this.player.angle -= 3;
    } else if (this.cursors.right.isDown) {
      this.player.angle += 3;
    }

    // 射击控制（带冷却时间）
    const canFire = time > this.lastFireTime + this.fireRate;

    if (canFire) {
      let shouldFire = false;
      let fireAngle = this.player.angle;

      if (this.keyW.isDown) {
        shouldFire = true;
        // W键：向当前朝向发射
      } else if (this.keyS.isDown) {
        shouldFire = true;
        // S键：向相反方向发射
        fireAngle += 180;
      } else if (this.keyA.isDown) {
        shouldFire = true;
        // A键：向左侧发射
        fireAngle -= 90;
      } else if (this.keyD.isDown) {
        shouldFire = true;
        // D键：向右侧发射
        fireAngle += 90;
      }

      if (shouldFire) {
        this.fireBullet(fireAngle);
        this.lastFireTime = time;
      }
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -50 || bullet.x > 850 || 
            bullet.y < -50 || bullet.y > 650) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });

    // 更新UI
    this.infoText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.bullets.countActive(true)}`,
      `Player Angle: ${Math.round(this.player.angle)}°`
    ]);
  }

  fireBullet(angle) {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 计算子弹速度（Phaser角度从-90度开始，即0度指向右侧）
      // 玩家默认朝上，所以需要减90度转换
      const angleInRadians = Phaser.Math.DegToRad(angle - 90);
      const velocityVector = this.physics.velocityFromAngle(angle - 90, 300);
      
      bullet.setVelocity(velocityVector.x, velocityVector.y);
      bullet.setRotation(angleInRadians);
      
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
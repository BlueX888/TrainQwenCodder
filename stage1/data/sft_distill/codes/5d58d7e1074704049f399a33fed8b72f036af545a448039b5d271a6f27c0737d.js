class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证状态：发射的子弹总数
    this.activeBullets = 0; // 可验证状态：当前活跃的子弹数
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建子弹纹理（灰色圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0x808080, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组（对象池）
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: false
    });

    // 设置键盘输入
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 防止连续发射的冷却时间
    this.shootCooldown = 0;
    this.shootDelay = 200; // 毫秒

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, height - 40, 'Press WASD to shoot bullets', {
      fontSize: '14px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    // 更新冷却时间
    if (this.shootCooldown > 0) {
      this.shootCooldown -= delta;
    }

    // 检测WASD按键发射子弹
    if (this.shootCooldown <= 0) {
      let velocityX = 0;
      let velocityY = 0;
      let shouldShoot = false;

      if (this.keyW.isDown) {
        velocityY = -200;
        shouldShoot = true;
      } else if (this.keyS.isDown) {
        velocityY = 200;
        shouldShoot = true;
      }

      if (this.keyA.isDown) {
        velocityX = -200;
        shouldShoot = true;
      } else if (this.keyD.isDown) {
        velocityX = 200;
        shouldShoot = true;
      }

      if (shouldShoot) {
        this.shootBullet(velocityX, velocityY);
        this.shootCooldown = this.shootDelay;
      }
    }

    // 检查并回收离开边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        const bounds = this.cameras.main;
        if (
          bullet.x < -20 ||
          bullet.x > bounds.width + 20 ||
          bullet.y < -20 ||
          bullet.y > bounds.height + 20
        ) {
          this.recycleBullet(bullet);
        }
      }
    });

    // 更新状态显示
    this.updateStatus();
  }

  shootBullet(velocityX, velocityY) {
    // 从对象池获取子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      bullet.setVelocity(velocityX, velocityY);

      this.bulletsFired++;
      this.activeBullets++;
    }
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;
    bullet.setVelocity(0, 0);

    this.activeBullets--;
  }

  updateStatus() {
    this.statusText.setText(
      `Bullets Fired: ${this.bulletsFired}\n` +
      `Active Bullets: ${this.activeBullets}\n` +
      `Pool Size: ${this.bullets.getLength()}`
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
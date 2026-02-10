class BulletScene extends Phaser.Scene {
  constructor() {
    super('BulletScene');
    this.bulletsFired = 0;
    this.bulletsActive = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建蓝色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0088ff, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建子弹对象池
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: false
    });

    // 创建玩家位置标记（用于发射起点）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    this.player = this.add.sprite(400, 500, 'player');

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.fireBullet(pointer);
      }
    });

    // 添加提示文本
    this.add.text(10, 10, 'Click to fire bullets', {
      fontSize: '18px',
      color: '#ffffff'
    });

    // 状态显示文本
    this.statsText = this.add.text(10, 40, '', {
      fontSize: '16px',
      color: '#ffff00'
    });

    // 初始化信号对象
    window.__signals__ = {
      bulletsFired: 0,
      bulletsActive: 0,
      bulletsRecycled: 0
    };

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now()
    }));
  }

  fireBullet(pointer) {
    // 从对象池获取子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 计算从玩家到鼠标点击位置的方向
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.x,
        pointer.y
      );

      // 设置子弹速度（速度160）
      this.physics.velocityFromRotation(angle, 160, bullet.body.velocity);

      // 更新统计
      this.bulletsFired++;
      this.bulletsActive = this.bullets.countActive(true);

      // 更新信号
      window.__signals__.bulletsFired = this.bulletsFired;
      window.__signals__.bulletsActive = this.bulletsActive;

      console.log(JSON.stringify({
        event: 'bullet_fired',
        bulletsFired: this.bulletsFired,
        bulletsActive: this.bulletsActive,
        position: { x: this.player.x, y: this.player.y },
        target: { x: pointer.x, y: pointer.y },
        timestamp: Date.now()
      }));
    }
  }

  update(time, delta) {
    // 检查所有活跃的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检查是否离开边界
        if (
          bullet.x < -20 ||
          bullet.x > this.scale.width + 20 ||
          bullet.y < -20 ||
          bullet.y > this.scale.height + 20
        ) {
          // 回收子弹
          this.recycleBullet(bullet);
        }
      }
    });

    // 更新活跃子弹数
    this.bulletsActive = this.bullets.countActive(true);
    window.__signals__.bulletsActive = this.bulletsActive;

    // 更新状态显示
    this.statsText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.bulletsActive}`,
      `Recycled: ${window.__signals__.bulletsRecycled}`
    ]);
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.stop();

    window.__signals__.bulletsRecycled++;

    console.log(JSON.stringify({
      event: 'bullet_recycled',
      bulletsRecycled: window.__signals__.bulletsRecycled,
      timestamp: Date.now()
    }));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: BulletScene
};

new Phaser.Game(config);
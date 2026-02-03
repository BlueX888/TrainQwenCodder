class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 状态信号：已发射子弹数
    this.activeBullets = 0; // 状态信号：当前活跃子弹数
  }

  preload() {
    // 无需预加载外部资源
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

    // 创建子弹对象池（使用 Arcade Physics Group）
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: false
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加射击冷却时间
    this.lastFired = 0;
    this.fireRate = 200; // 200ms 冷却

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 更新状态文本
    this.updateStatusText();

    // 检测方向键并发射子弹
    if (time > this.lastFired + this.fireRate) {
      let velocityX = 0;
      let velocityY = 0;

      if (this.cursors.left.isDown) {
        velocityX = -80;
      } else if (this.cursors.right.isDown) {
        velocityX = 80;
      }

      if (this.cursors.up.isDown) {
        velocityY = -80;
      } else if (this.cursors.down.isDown) {
        velocityY = 80;
      }

      // 如果有方向键按下，发射子弹
      if (velocityX !== 0 || velocityY !== 0) {
        this.fireBullet(velocityX, velocityY);
        this.lastFired = time;
      }
    }

    // 检查并回收离开边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        const { width, height } = this.cameras.main;
        if (bullet.x < -10 || bullet.x > width + 10 || 
            bullet.y < -10 || bullet.y > height + 10) {
          this.recycleBullet(bullet);
        }
      }
    });

    // 更新活跃子弹数
    this.activeBullets = this.bullets.countActive(true);
  }

  fireBullet(velocityX, velocityY) {
    // 从对象池获取子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);

    if (bullet) {
      // 激活并设置子弹
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      
      // 设置子弹速度
      bullet.setVelocity(velocityX, velocityY);

      // 更新统计
      this.bulletsFired++;
    }
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;
    bullet.setVelocity(0, 0);
  }

  updateStatusText() {
    this.statusText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.activeBullets}`,
      `Pool Size: ${this.bullets.getLength()}`,
      '',
      'Use Arrow Keys to Fire'
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
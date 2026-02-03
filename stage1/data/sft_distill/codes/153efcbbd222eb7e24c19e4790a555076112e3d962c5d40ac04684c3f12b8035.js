class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证状态信号
    this.activeBullets = 0; // 当前活跃子弹数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建子弹纹理（紫色圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0x9932cc, 1); // 紫色
    bulletGraphics.fillCircle(6, 6, 6);
    bulletGraphics.generateTexture('bullet', 12, 12);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹对象池
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 发射冷却时间
    this.lastFired = 0;
    this.fireRate = 200; // 200ms冷却

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, height - 40, '使用方向键发射紫色子弹', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 更新状态显示
    this.updateStatusText();

    // 检测方向键输入并发射子弹
    if (time > this.lastFired + this.fireRate) {
      let direction = null;
      let velocityX = 0;
      let velocityY = 0;

      if (this.cursors.left.isDown) {
        direction = 'left';
        velocityX = -240;
        velocityY = 0;
      } else if (this.cursors.right.isDown) {
        direction = 'right';
        velocityX = 240;
        velocityY = 0;
      } else if (this.cursors.up.isDown) {
        direction = 'up';
        velocityX = 0;
        velocityY = -240;
      } else if (this.cursors.down.isDown) {
        direction = 'down';
        velocityX = 0;
        velocityY = 240;
      }

      if (direction) {
        this.fireBullet(velocityX, velocityY);
        this.lastFired = time;
      }
    }

    // 检查子弹是否离开边界，离开则回收
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        const bounds = this.physics.world.bounds;
        if (
          bullet.x < bounds.x - 20 ||
          bullet.x > bounds.x + bounds.width + 20 ||
          bullet.y < bounds.y - 20 ||
          bullet.y > bounds.y + bounds.height + 20
        ) {
          this.recycleBullet(bullet);
        }
      }
    });
  }

  fireBullet(velocityX, velocityY) {
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

  updateStatusText() {
    this.statusText.setText(
      `发射总数: ${this.bulletsFired}\n` +
      `活跃子弹: ${this.activeBullets}\n` +
      `对象池大小: ${this.bullets.getLength()}`
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
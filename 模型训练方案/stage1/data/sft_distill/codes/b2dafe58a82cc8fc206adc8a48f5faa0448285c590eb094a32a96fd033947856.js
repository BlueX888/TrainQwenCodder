class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证状态信号
    this.activeBullets = 0; // 当前激活的子弹数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家飞船纹理（绿色三角形）
    const shipGraphics = this.add.graphics();
    shipGraphics.fillStyle(0x00ff00, 1);
    shipGraphics.beginPath();
    shipGraphics.moveTo(20, 0);
    shipGraphics.lineTo(0, 30);
    shipGraphics.lineTo(40, 30);
    shipGraphics.closePath();
    shipGraphics.fillPath();
    shipGraphics.generateTexture('ship', 40, 30);
    shipGraphics.destroy();

    // 创建子弹纹理（蓝色圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0x0000ff, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();

    // 创建玩家飞船
    this.player = this.physics.add.sprite(width / 2, height - 100, 'ship');
    this.player.setCollideWorldBounds(true);

    // 创建子弹对象池（使用Physics.Arcade.Group）
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20, // 对象池最大容量
      runChildUpdate: false
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 更新状态文本
    this.updateStatusText();
  }

  update(time, delta) {
    // 检测空格键按下（使用JustDown避免连续触发）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.fireBullet();
    }

    // 检查并回收离开边界的子弹
    this.bulletPool.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检查是否离开屏幕边界
        if (
          bullet.y < -bullet.height ||
          bullet.y > this.cameras.main.height + bullet.height ||
          bullet.x < -bullet.width ||
          bullet.x > this.cameras.main.width + bullet.width
        ) {
          this.recycleBullet(bullet);
        }
      }
    });

    // 更新状态文本
    this.updateStatusText();
  }

  fireBullet() {
    // 从对象池获取子弹
    let bullet = this.bulletPool.get(this.player.x, this.player.y - 20);

    if (bullet) {
      // 激活子弹
      bullet.setActive(true);
      bullet.setVisible(true);

      // 设置子弹速度（向上发射）
      bullet.body.velocity.y = -160;
      bullet.body.velocity.x = 0;

      // 更新计数器
      this.bulletsFired++;
      this.activeBullets++;

      console.log(`Bullet fired! Total: ${this.bulletsFired}, Active: ${this.activeBullets}`);
    }
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.velocity.set(0);

    // 更新激活子弹计数
    this.activeBullets--;

    console.log(`Bullet recycled. Active: ${this.activeBullets}`);
  }

  updateStatusText() {
    this.statusText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.activeBullets}`,
      `Pool Size: ${this.bulletPool.getLength()}`,
      `Press SPACE to fire`
    ]);
  }
}

// 游戏配置
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

// 创建游戏实例
new Phaser.Game(config);
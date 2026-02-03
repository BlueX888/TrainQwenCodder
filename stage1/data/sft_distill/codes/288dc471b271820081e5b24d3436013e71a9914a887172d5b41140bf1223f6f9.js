class BulletScene extends Phaser.Scene {
  constructor() {
    super('BulletScene');
    this.bulletsFired = 0; // 状态信号：记录发射的子弹数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建蓝色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1); // 蓝色
    graphics.fillCircle(8, 8, 8); // 圆形子弹，半径8
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建玩家（简单的绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹对象池（使用物理组）
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20, // 对象池最大容量
      runChildUpdate: false
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // 添加显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    // 更新状态文本
    this.updateStatusText();

    // 添加说明文本
    this.add.text(10, 40, 'Press SPACE to fire bullets', {
      fontSize: '16px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    // 检测空格键按下（使用 justDown 避免连续触发）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.fireBullet();
    }

    // 回收离开边界的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检查子弹是否离开屏幕边界
        if (
          bullet.y < -20 ||
          bullet.y > this.cameras.main.height + 20 ||
          bullet.x < -20 ||
          bullet.x > this.cameras.main.width + 20
        ) {
          // 回收子弹到对象池
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.stop();
        }
      }
    });
  }

  fireBullet() {
    // 从对象池获取子弹
    const bullet = this.bullets.get(this.player.x, this.player.y - 30);

    if (bullet) {
      // 激活子弹
      bullet.setActive(true);
      bullet.setVisible(true);

      // 设置子弹速度（向上发射）
      bullet.body.setVelocity(0, -240);

      // 增加发射计数
      this.bulletsFired++;
      this.updateStatusText();

      console.log(`Bullet fired! Total: ${this.bulletsFired}`);
    }
  }

  updateStatusText() {
    const activeCount = this.bullets.countActive(true);
    const totalCount = this.bullets.getLength();
    this.statusText.setText(
      `Bullets Fired: ${this.bulletsFired} | Active: ${activeCount}/${totalCount}`
    );
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: BulletScene
};

// 创建游戏实例
const game = new Phaser.Game(config);
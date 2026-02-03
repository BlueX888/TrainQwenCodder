class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建红色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(8, 8, 8); // 圆形子弹，半径8
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建玩家位置（屏幕中心）
    this.playerX = 400;
    this.playerY = 300;

    // 绘制玩家（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    this.player = this.add.sprite(this.playerX, this.playerY, 'player');

    // 创建子弹对象池（使用物理组）
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 监听 WASD 键
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 添加文本显示发射数量
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    // 防止按键重复触发的冷却时间
    this.lastFireTime = 0;
    this.fireDelay = 200; // 200ms 冷却时间

    console.log('Game initialized. Press WASD to shoot bullets.');
  }

  update(time, delta) {
    // 更新统计信息
    this.statsText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.bullets.countActive(true)}`,
      `Pool Size: ${this.bullets.getLength()}`
    ]);

    // 检查是否可以发射（冷却时间）
    const canFire = time > this.lastFireTime + this.fireDelay;

    // 检测 WASD 按键并发射子弹
    if (canFire) {
      if (this.keyW.isDown) {
        this.fireBullet(0, -1); // 向上
        this.lastFireTime = time;
      } else if (this.keyS.isDown) {
        this.fireBullet(0, 1); // 向下
        this.lastFireTime = time;
      } else if (this.keyA.isDown) {
        this.fireBullet(-1, 0); // 向左
        this.lastFireTime = time;
      } else if (this.keyD.isDown) {
        this.fireBullet(1, 0); // 向右
        this.lastFireTime = time;
      }
    }

    // 回收离开边界的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        const bounds = this.physics.world.bounds;
        if (
          bullet.x < bounds.x - 20 ||
          bullet.x > bounds.x + bounds.width + 20 ||
          bullet.y < bounds.y - 20 ||
          bullet.y > bounds.y + bounds.height + 20
        ) {
          // 回收到对象池
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.stop();
        }
      }
    });
  }

  fireBullet(dirX, dirY) {
    // 从对象池获取子弹
    let bullet = this.bullets.get(this.playerX, this.playerY);

    if (bullet) {
      // 激活子弹
      bullet.setActive(true);
      bullet.setVisible(true);

      // 设置子弹速度
      const speed = 200;
      bullet.body.setVelocity(dirX * speed, dirY * speed);

      // 增加发射计数
      this.bulletsFired++;

      console.log(`Bullet fired! Direction: (${dirX}, ${dirY}), Total: ${this.bulletsFired}`);
    } else {
      console.log('Object pool is full!');
    }
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
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);
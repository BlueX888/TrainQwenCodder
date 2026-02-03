class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0;
    this.activeBullets = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建粉色子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xff69b4, 1); // 粉色
    bulletGraphics.fillCircle(8, 8, 8);
    bulletGraphics.generateTexture('bullet', 16, 16);
    bulletGraphics.destroy();

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹对象池（物理组）
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 最大子弹数
      runChildUpdate: false
    });

    // 设置WASD按键
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 防止按键重复触发的冷却时间
    this.shootCooldown = 0;

    // 显示提示文本
    this.add.text(10, 10, 'Press WASD to shoot bullets', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 显示统计信息
    this.statsText = this.add.text(10, 30, '', {
      fontSize: '14px',
      color: '#ffff00'
    });

    // 初始化signals
    window.__signals__ = {
      bulletsFired: 0,
      activeBullets: 0,
      poolSize: 0
    };

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now()
    }));
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
        velocityY = -120;
        shouldShoot = true;
      } else if (this.keyS.isDown) {
        velocityY = 120;
        shouldShoot = true;
      }

      if (this.keyA.isDown) {
        velocityX = -120;
        shouldShoot = true;
      } else if (this.keyD.isDown) {
        velocityX = 120;
        shouldShoot = true;
      }

      if (shouldShoot) {
        this.shootBullet(velocityX, velocityY);
        this.shootCooldown = 200; // 200ms冷却时间
      }
    }

    // 检查子弹是否离开边界并回收
    this.bulletPool.getChildren().forEach(bullet => {
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

    // 更新统计信息
    this.activeBullets = this.bulletPool.countActive(true);
    this.statsText.setText(
      `Fired: ${this.bulletsFired} | Active: ${this.activeBullets} | Pool: ${this.bulletPool.getLength()}`
    );

    // 更新signals
    window.__signals__.bulletsFired = this.bulletsFired;
    window.__signals__.activeBullets = this.activeBullets;
    window.__signals__.poolSize = this.bulletPool.getLength();
  }

  shootBullet(velocityX, velocityY) {
    // 从对象池获取或创建子弹
    let bullet = this.bulletPool.get(this.player.x, this.player.y);

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      
      // 设置子弹速度
      bullet.setVelocity(velocityX, velocityY);

      // 增加发射计数
      this.bulletsFired++;

      // 输出日志
      console.log(JSON.stringify({
        event: 'bullet_fired',
        bulletsFired: this.bulletsFired,
        direction: { x: velocityX, y: velocityY },
        position: { x: bullet.x, y: bullet.y },
        timestamp: Date.now()
      }));
    }
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;
    bullet.setVelocity(0, 0);

    console.log(JSON.stringify({
      event: 'bullet_recycled',
      activeBullets: this.bulletPool.countActive(true),
      timestamp: Date.now()
    }));
  }
}

// 游戏配置
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

// 启动游戏
new Phaser.Game(config);
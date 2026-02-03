class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证的状态信号
    this.activeBullets = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建青色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillCircle(8, 8, 8); // 圆形子弹，半径8
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建物理组作为对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false,
      createCallback: (bullet) => {
        bullet.body.onWorldBounds = true;
        // 监听子弹离开世界边界
        bullet.body.world.on('worldbounds', (body) => {
          if (body.gameObject === bullet) {
            this.recycleBullet(bullet);
          }
        });
      }
    });

    // 设置世界边界碰撞检测
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加额外的 WASD 键支持
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 创建玩家（发射点）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    this.player = this.add.sprite(400, 300, 'player');

    // 添加信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 防止按键重复触发的冷却时间
    this.shootCooldown = 0;
    this.shootDelay = 150; // 150ms 冷却

    this.updateInfoText();
  }

  update(time, delta) {
    // 更新冷却时间
    if (this.shootCooldown > 0) {
      this.shootCooldown -= delta;
    }

    // 检测方向键输入并发射子弹
    if (this.shootCooldown <= 0) {
      let velocityX = 0;
      let velocityY = 0;

      // 上方向键或 W 键
      if (this.cursors.up.isDown || this.keyW.isDown) {
        velocityY = -200;
      }
      // 下方向键或 S 键
      else if (this.cursors.down.isDown || this.keyS.isDown) {
        velocityY = 200;
      }
      // 左方向键或 A 键
      else if (this.cursors.left.isDown || this.keyA.isDown) {
        velocityX = -200;
      }
      // 右方向键或 D 键
      else if (this.cursors.right.isDown || this.keyD.isDown) {
        velocityX = 200;
      }

      // 如果有方向输入，发射子弹
      if (velocityX !== 0 || velocityY !== 0) {
        this.fireBullet(velocityX, velocityY);
        this.shootCooldown = this.shootDelay;
      }
    }

    this.updateInfoText();
  }

  fireBullet(velocityX, velocityY) {
    // 从对象池获取子弹
    const bullet = this.bulletPool.get(this.player.x, this.player.y);

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      bullet.body.setVelocity(velocityX, velocityY);
      bullet.body.setCollideWorldBounds(true);

      this.bulletsFired++;
      this.activeBullets++;
    }
  }

  recycleBullet(bullet) {
    if (bullet.active) {
      bullet.setActive(false);
      bullet.setVisible(false);
      bullet.body.enable = false;
      bullet.body.setVelocity(0, 0);
      this.activeBullets--;
    }
  }

  updateInfoText() {
    this.infoText.setText([
      '按方向键或 WASD 发射子弹',
      `已发射: ${this.bulletsFired}`,
      `活跃子弹: ${this.activeBullets}`,
      `对象池大小: ${this.bulletPool.getLength()}`,
      `对象池容量: ${this.bulletPool.maxSize}`
    ]);
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

// 创建游戏实例
const game = new Phaser.Game(config);
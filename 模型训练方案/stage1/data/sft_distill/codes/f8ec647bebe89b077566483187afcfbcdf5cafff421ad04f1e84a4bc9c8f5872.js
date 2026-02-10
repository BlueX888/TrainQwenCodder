class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证的状态信号
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建子弹纹理（绿色圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0x00ff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组（对象池）
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30, // 对象池最大容量
      runChildUpdate: false
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // 添加显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 添加方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update(time, delta) {
    // 更新状态文本
    this.statusText.setText(
      `Bullets Fired: ${this.bulletsFired}\n` +
      `Active Bullets: ${this.bullets.countActive(true)}\n` +
      `Pool Size: ${this.bullets.getLength()}`
    );

    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 空格键发射子弹（按下时触发一次）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.fireBullet();
    }

    // 检查子弹边界并回收
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 子弹离开屏幕边界则回收
        if (
          bullet.y < -10 ||
          bullet.y > this.cameras.main.height + 10 ||
          bullet.x < -10 ||
          bullet.x > this.cameras.main.width + 10
        ) {
          this.bullets.killAndHide(bullet);
          bullet.body.enable = false;
        }
      }
    });
  }

  fireBullet() {
    // 从对象池获取子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;

      // 设置子弹速度（向上发射）
      bullet.setVelocity(0, -160);

      // 增加发射计数
      this.bulletsFired++;

      console.log(`Bullet fired! Total: ${this.bulletsFired}`);
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
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证状态：发射的子弹总数
  }

  preload() {
    // 使用Graphics创建红色子弹纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建子弹对象池（使用物理组）
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false
    });

    // 添加WASD键盘监听
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 创建发射点（屏幕中心）
    this.playerX = 400;
    this.playerY = 300;

    // 绘制发射点标识
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(this.playerX, this.playerY, 10);

    // 添加提示文本
    this.add.text(10, 10, 'Press WASD to fire bullets', {
      fontSize: '18px',
      color: '#ffffff'
    });

    // 显示发射计数
    this.bulletCountText = this.add.text(10, 40, 'Bullets fired: 0', {
      fontSize: '16px',
      color: '#ffff00'
    });

    // 显示活跃子弹数
    this.activeBulletsText = this.add.text(10, 65, 'Active bullets: 0', {
      fontSize: '16px',
      color: '#00ffff'
    });
  }

  update(time, delta) {
    // 检测WASD按键并发射子弹
    if (Phaser.Input.Keyboard.JustDown(this.keyW)) {
      this.fireBullet(0, -1); // 向上
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyA)) {
      this.fireBullet(-1, 0); // 向左
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyS)) {
      this.fireBullet(0, 1); // 向下
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyD)) {
      this.fireBullet(1, 0); // 向右
    }

    // 检查并回收离开边界的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        if (
          bullet.x < -50 ||
          bullet.x > this.scale.width + 50 ||
          bullet.y < -50 ||
          bullet.y > this.scale.height + 50
        ) {
          // 回收子弹到对象池
          this.bullets.killAndHide(bullet);
          bullet.body.reset(0, 0);
        }
      }
    });

    // 更新活跃子弹数显示
    const activeBullets = this.bullets.countActive(true);
    this.activeBulletsText.setText(`Active bullets: ${activeBullets}`);
  }

  fireBullet(dirX, dirY) {
    // 从对象池获取子弹
    const bullet = this.bullets.get(this.playerX, this.playerY);

    if (bullet) {
      // 激活并显示子弹
      bullet.setActive(true);
      bullet.setVisible(true);

      // 设置子弹速度（速度200）
      bullet.body.setVelocity(dirX * 200, dirY * 200);

      // 更新发射计数
      this.bulletsFired++;
      this.bulletCountText.setText(`Bullets fired: ${this.bulletsFired}`);
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
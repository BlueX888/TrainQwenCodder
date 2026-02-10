class BulletScene extends Phaser.Scene {
  constructor() {
    super('BulletScene');
    this.bulletsFired = 0; // 可验证的状态信号
    this.activeBullets = 0; // 当前活跃子弹数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建橙色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff8800, 1); // 橙色
    graphics.fillCircle(8, 8, 8); // 圆形子弹，半径8
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建子弹对象池（使用物理组）
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false
    });

    // 创建发射器位置指示（屏幕中心）
    const shooter = this.add.graphics();
    shooter.fillStyle(0x00ff00, 1);
    shooter.fillCircle(400, 300, 10);
    this.shooterX = 400;
    this.shooterY = 300;

    // 监听鼠标右键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.fireBullet(pointer.x, pointer.y);
      }
    });

    // 添加提示文本
    this.add.text(10, 10, '右键点击发射橙色子弹', {
      fontSize: '18px',
      color: '#ffffff'
    });

    // 显示状态信息
    this.statsText = this.add.text(10, 40, '', {
      fontSize: '16px',
      color: '#ffff00'
    });

    this.updateStatsText();
  }

  fireBullet(targetX, targetY) {
    // 从对象池获取子弹
    const bullet = this.bullets.get(this.shooterX, this.shooterY);

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 计算从发射器到目标点的方向，设置速度
      const angle = Phaser.Math.Angle.Between(
        this.shooterX,
        this.shooterY,
        targetX,
        targetY
      );

      // 设置子弹速度（速度为120）
      this.physics.velocityFromRotation(angle, 120, bullet.body.velocity);

      // 更新统计信息
      this.bulletsFired++;
      this.activeBullets++;
      this.updateStatsText();
    }
  }

  update(time, delta) {
    // 检查所有活跃的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检查子弹是否离开边界
        if (
          bullet.x < -20 ||
          bullet.x > 820 ||
          bullet.y < -20 ||
          bullet.y > 620
        ) {
          // 回收到对象池
          this.bullets.killAndHide(bullet);
          bullet.body.reset(0, 0);
          this.activeBullets--;
          this.updateStatsText();
        }
      }
    });
  }

  updateStatsText() {
    this.statsText.setText([
      `已发射子弹: ${this.bulletsFired}`,
      `活跃子弹: ${this.activeBullets}`,
      `对象池大小: ${this.bullets.getLength()}`
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
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: BulletScene
};

// 创建游戏实例
new Phaser.Game(config);
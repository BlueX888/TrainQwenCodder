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
    graphics.fillCircle(8, 8, 8); // 半径8的圆形
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建子弹对象池（物理组）
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false
    });

    // 添加提示文本
    this.add.text(10, 10, '右键点击发射橙色子弹', {
      fontSize: '18px',
      color: '#ffffff'
    });

    // 显示统计信息
    this.statsText = this.add.text(10, 40, '', {
      fontSize: '16px',
      color: '#00ff00'
    });

    // 监听鼠标右键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 检查是否是右键（button === 2）
      if (pointer.rightButtonDown()) {
        this.fireBullet(pointer.x, pointer.y);
      }
    });

    // 启用右键菜单禁用（可选，防止浏览器右键菜单弹出）
    this.input.mouse.disableContextMenu();

    this.updateStats();
  }

  fireBullet(x, y) {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(x, y);

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 设置子弹速度（向右发射）
      bullet.body.setVelocity(120, 0);

      // 更新统计
      this.bulletsFired++;
      this.activeBullets = this.bullets.countActive(true);
      this.updateStats();
    }
  }

  update(time, delta) {
    // 检查子弹是否离开边界，如果离开则回收
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检查是否离开屏幕边界
        if (
          bullet.x < -20 ||
          bullet.x > this.scale.width + 20 ||
          bullet.y < -20 ||
          bullet.y > this.scale.height + 20
        ) {
          // 回收子弹到对象池
          this.bullets.killAndHide(bullet);
          bullet.body.reset(0, 0);

          // 更新活跃子弹数
          this.activeBullets = this.bullets.countActive(true);
          this.updateStats();
        }
      }
    });
  }

  updateStats() {
    // 更新统计信息显示
    this.statsText.setText([
      `已发射子弹: ${this.bulletsFired}`,
      `活跃子弹: ${this.activeBullets}`,
      `对象池总数: ${this.bullets.getLength()}`,
      `对象池可用: ${this.bullets.getTotalFree()}`
    ]);
  }
}

// Phaser 游戏配置
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
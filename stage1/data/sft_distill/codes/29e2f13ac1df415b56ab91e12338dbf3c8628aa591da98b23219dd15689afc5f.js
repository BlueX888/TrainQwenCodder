class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0;
    this.activeBullets = 0;
  }

  preload() {
    // 使用 Graphics 生成灰色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillCircle(4, 4, 4); // 圆形子弹，半径4
    graphics.generateTexture('bullet', 8, 8);
    graphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      bulletsFired: 0,
      activeBullets: 0,
      poolSize: 0
    };

    // 创建子弹对象池（使用 Arcade Physics Group）
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false
    });

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 只响应左键
      if (pointer.leftButtonDown()) {
        this.fireBullet(pointer.x, pointer.y);
      }
    });

    // 添加提示文本
    this.add.text(10, 10, 'Click to fire bullets', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 显示统计信息
    this.statsText = this.add.text(10, 40, '', {
      fontSize: '14px',
      color: '#00ff00'
    });
  }

  fireBullet(x, y) {
    // 从对象池获取或创建子弹
    const bullet = this.bulletPool.get(x, y);

    if (bullet) {
      // 激活子弹
      bullet.setActive(true);
      bullet.setVisible(true);

      // 设置子弹速度（向右发射，速度80）
      bullet.body.setVelocity(80, 0);

      // 更新统计
      this.bulletsFired++;
      this.activeBullets = this.bulletPool.countActive(true);

      // 更新信号
      window.__signals__.bulletsFired = this.bulletsFired;
      window.__signals__.activeBullets = this.activeBullets;
      window.__signals__.poolSize = this.bulletPool.getLength();

      // 输出日志
      console.log(JSON.stringify({
        event: 'bullet_fired',
        position: { x, y },
        totalFired: this.bulletsFired,
        active: this.activeBullets
      }));
    }
  }

  update(time, delta) {
    // 检查所有活跃的子弹
    this.bulletPool.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检查子弹是否离开边界
        if (bullet.x < -10 || bullet.x > this.cameras.main.width + 10 ||
            bullet.y < -10 || bullet.y > this.cameras.main.height + 10) {
          
          // 回收子弹到对象池
          this.bulletPool.killAndHide(bullet);
          bullet.body.reset(0, 0);

          // 更新活跃子弹数
          this.activeBullets = this.bulletPool.countActive(true);
          window.__signals__.activeBullets = this.activeBullets;

          // 输出回收日志
          console.log(JSON.stringify({
            event: 'bullet_recycled',
            active: this.activeBullets
          }));
        }
      }
    });

    // 更新统计显示
    this.statsText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.activeBullets}`,
      `Pool Size: ${this.bulletPool.getLength()}`
    ]);
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

const game = new Phaser.Game(config);
// 初始化可验证信号
window.__signals__ = {
  bulletsFired: 0,
  activeBullets: 0,
  bulletsRecycled: 0
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bullets = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建白色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(4, 4, 4); // 圆形子弹，半径4
    graphics.generateTexture('bullet', 8, 8);
    graphics.destroy();

    // 创建子弹对象池
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false
    });

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.fireBullet(pointer.x, pointer.y);
      }
    });

    // 添加提示文本
    this.add.text(10, 10, 'Click to fire bullets', {
      fontSize: '18px',
      color: '#ffffff'
    });

    // 显示统计信息
    this.statsText = this.add.text(10, 40, '', {
      fontSize: '14px',
      color: '#00ff00'
    });

    console.log(JSON.stringify({
      event: 'game_started',
      timestamp: Date.now()
    }));
  }

  fireBullet(x, y) {
    // 从对象池获取子弹
    const bullet = this.bullets.get(x, y);

    if (bullet) {
      // 激活子弹
      bullet.setActive(true);
      bullet.setVisible(true);

      // 设置子弹速度（向右发射）
      bullet.body.velocity.x = 80;
      bullet.body.velocity.y = 0;

      // 更新信号
      window.__signals__.bulletsFired++;
      window.__signals__.activeBullets = this.bullets.countActive(true);

      console.log(JSON.stringify({
        event: 'bullet_fired',
        position: { x, y },
        bulletsFired: window.__signals__.bulletsFired,
        timestamp: Date.now()
      }));
    }
  }

  update(time, delta) {
    // 检查所有活跃的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检查子弹是否离开边界
        if (
          bullet.x < -10 ||
          bullet.x > this.cameras.main.width + 10 ||
          bullet.y < -10 ||
          bullet.y > this.cameras.main.height + 10
        ) {
          // 回收子弹到对象池
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.velocity.set(0, 0);

          window.__signals__.bulletsRecycled++;
          window.__signals__.activeBullets = this.bullets.countActive(true);

          console.log(JSON.stringify({
            event: 'bullet_recycled',
            bulletsRecycled: window.__signals__.bulletsRecycled,
            timestamp: Date.now()
          }));
        }
      }
    });

    // 更新统计信息显示
    this.statsText.setText([
      `Bullets Fired: ${window.__signals__.bulletsFired}`,
      `Active Bullets: ${window.__signals__.activeBullets}`,
      `Bullets Recycled: ${window.__signals__.bulletsRecycled}`,
      `Pool Size: ${this.bullets.getLength()}`
    ]);
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
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);
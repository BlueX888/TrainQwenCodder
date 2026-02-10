class BulletScene extends Phaser.Scene {
  constructor() {
    super('BulletScene');
    this.bulletsFired = 0;
    this.bulletsRecycled = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建粉色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(8, 8, 8); // 半径8的圆形
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建子弹对象池（Physics Group）
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
    this.add.text(10, 10, 'Click left mouse button to fire pink bullets', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 显示统计信息
    this.statsText = this.add.text(10, 40, '', {
      fontSize: '14px',
      color: '#ffff00'
    });

    // 初始化 signals
    window.__signals__ = {
      bulletsFired: 0,
      bulletsRecycled: 0,
      activeBullets: 0
    };

    // 输出初始日志
    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now()
    }));
  }

  fireBullet(x, y) {
    // 从对象池获取子弹
    const bullet = this.bullets.get(x, y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹向右发射，速度240
      bullet.body.setVelocity(240, 0);
      
      // 更新统计
      this.bulletsFired++;
      window.__signals__.bulletsFired = this.bulletsFired;
      window.__signals__.activeBullets = this.bullets.countActive(true);
      
      // 输出发射日志
      console.log(JSON.stringify({
        event: 'bullet_fired',
        position: { x, y },
        bulletsFired: this.bulletsFired,
        timestamp: Date.now()
      }));
    }
  }

  update(time, delta) {
    // 检查并回收离开边界的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检查是否离开边界（左、右、上、下）
        if (bullet.x < -20 || bullet.x > this.scale.width + 20 ||
            bullet.y < -20 || bullet.y > this.scale.height + 20) {
          
          // 回收子弹
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.setVelocity(0, 0);
          
          // 更新统计
          this.bulletsRecycled++;
          window.__signals__.bulletsRecycled = this.bulletsRecycled;
          window.__signals__.activeBullets = this.bullets.countActive(true);
          
          // 输出回收日志
          console.log(JSON.stringify({
            event: 'bullet_recycled',
            position: { x: bullet.x, y: bullet.y },
            bulletsRecycled: this.bulletsRecycled,
            timestamp: Date.now()
          }));
        }
      }
    });

    // 更新统计文本
    this.statsText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Bullets Recycled: ${this.bulletsRecycled}`,
      `Active Bullets: ${this.bullets.countActive(true)}`
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
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: BulletScene
};

new Phaser.Game(config);
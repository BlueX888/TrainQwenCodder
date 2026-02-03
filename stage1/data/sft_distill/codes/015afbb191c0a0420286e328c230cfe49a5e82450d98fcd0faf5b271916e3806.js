class BulletScene extends Phaser.Scene {
  constructor() {
    super('BulletScene');
    this.bulletsFired = 0;
    this.bulletsActive = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建蓝色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建子弹对象池
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: false
    });

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.fireBullet(pointer.x, pointer.y);
      }
    });

    // 添加提示文本
    this.add.text(10, 10, 'Click to fire blue bullets', {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 创建状态显示文本
    this.statsText = this.add.text(10, 40, '', {
      fontSize: '16px',
      color: '#00ff00'
    });

    // 初始化信号对象
    window.__signals__ = {
      bulletsFired: 0,
      bulletsActive: 0,
      bulletsRecycled: 0
    };

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
      
      // 设置子弹速度（向右发射）
      bullet.body.velocity.x = 160;
      bullet.body.velocity.y = 0;
      
      // 更新统计
      this.bulletsFired++;
      this.bulletsActive = this.bullets.countActive(true);
      
      // 更新信号
      window.__signals__.bulletsFired = this.bulletsFired;
      window.__signals__.bulletsActive = this.bulletsActive;
      
      // 输出日志
      console.log(JSON.stringify({
        event: 'bullet_fired',
        position: { x, y },
        bulletsFired: this.bulletsFired,
        bulletsActive: this.bulletsActive,
        timestamp: Date.now()
      }));
    }
  }

  update(time, delta) {
    // 检查所有活跃子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检查是否超出边界
        if (bullet.x < -50 || bullet.x > this.game.config.width + 50 ||
            bullet.y < -50 || bullet.y > this.game.config.height + 50) {
          
          // 回收子弹到对象池
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.velocity.x = 0;
          bullet.body.velocity.y = 0;
          
          // 更新统计
          window.__signals__.bulletsRecycled++;
          
          // 输出回收日志
          console.log(JSON.stringify({
            event: 'bullet_recycled',
            totalRecycled: window.__signals__.bulletsRecycled,
            timestamp: Date.now()
          }));
        }
      }
    });

    // 更新活跃子弹数
    this.bulletsActive = this.bullets.countActive(true);
    window.__signals__.bulletsActive = this.bulletsActive;

    // 更新状态显示
    this.statsText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.bulletsActive}`,
      `Bullets Recycled: ${window.__signals__.bulletsRecycled}`
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
  scene: BulletScene
};

new Phaser.Game(config);
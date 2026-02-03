// 全局信号对象
window.__signals__ = {
  bulletsShot: 0,
  activeBullets: 0,
  poolSize: 0,
  events: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bullets = null;
  }

  preload() {
    // 创建灰色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillCircle(8, 8, 8); // 圆形子弹，半径8
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建子弹对象池（Physics Group）
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 监听鼠标右键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.shootBullet(pointer.x, pointer.y);
      }
    });

    // 添加提示文本
    this.add.text(10, 10, 'Right click to shoot bullets', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 显示统计信息
    this.statsText = this.add.text(10, 40, '', {
      fontSize: '14px',
      color: '#00ff00'
    });

    console.log('[INIT] Game scene created, bullet pool ready');
  }

  shootBullet(x, y) {
    // 从对象池获取子弹
    const bullet = this.bullets.get(x, y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹速度（向右发射）
      bullet.body.setVelocity(120, 0);
      
      // 更新信号
      window.__signals__.bulletsShot++;
      window.__signals__.events.push({
        type: 'BULLET_SHOT',
        timestamp: Date.now(),
        position: { x, y },
        velocity: 120
      });

      console.log(`[SHOOT] Bullet fired at (${x}, ${y}), total: ${window.__signals__.bulletsShot}`);
    } else {
      console.log('[POOL] Bullet pool exhausted');
    }
  }

  update(time, delta) {
    // 检查所有活跃子弹
    const activeBullets = this.bullets.getChildren().filter(b => b.active);
    
    activeBullets.forEach((bullet) => {
      // 检测是否离开边界
      if (bullet.x < -50 || bullet.x > this.scale.width + 50 ||
          bullet.y < -50 || bullet.y > this.scale.height + 50) {
        
        // 回收子弹到对象池
        this.bullets.killAndHide(bullet);
        bullet.body.reset(0, 0);
        bullet.body.setVelocity(0, 0);
        
        window.__signals__.events.push({
          type: 'BULLET_RECYCLED',
          timestamp: Date.now(),
          position: { x: bullet.x, y: bullet.y }
        });

        console.log(`[RECYCLE] Bullet recycled at (${Math.round(bullet.x)}, ${Math.round(bullet.y)})`);
      }
    });

    // 更新统计信息
    const activeCount = activeBullets.length;
    window.__signals__.activeBullets = activeCount;
    window.__signals__.poolSize = this.bullets.getLength();

    this.statsText.setText([
      `Bullets Shot: ${window.__signals__.bulletsShot}`,
      `Active Bullets: ${activeCount}`,
      `Pool Size: ${window.__signals__.poolSize}`
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
  scene: GameScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始化信号
console.log('[INIT] Game initialized with bullet pool system');
console.log('[SIGNALS] Access window.__signals__ for game state');
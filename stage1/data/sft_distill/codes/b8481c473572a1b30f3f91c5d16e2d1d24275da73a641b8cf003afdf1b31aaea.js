// 对象池压力测试 - 持续生成/回收橙色子弹
class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.cycleCount = 0;
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号存储
    window.__signals__ = {
      activeCount: 0,
      cycleCount: 0,
      totalSpawned: 0,
      totalRecycled: 0,
      poolSize: 12,
      logs: []
    };

    // 创建橙色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8800, 1); // 橙色
    graphics.fillCircle(8, 8, 8); // 半径8的圆形
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建对象池 - Physics Group
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 12, // 最大12个对象
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.enable = false;
      }
    });

    // 创建显示文本
    this.statusText = this.add.text(10, 10, '', {
      font: '16px Arial',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);

    // 定时器 - 每200ms生成一个子弹
    this.spawnTimer = this.time.addEvent({
      delay: 200,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 定时器 - 每50ms更新状态显示
    this.updateTimer = this.time.addEvent({
      delay: 50,
      callback: this.updateStatus,
      callbackScope: this,
      loop: true
    });

    // 初始日志
    this.logEvent('System initialized', {
      poolSize: 12,
      spawnInterval: 200
    });
  }

  spawnBullet() {
    // 从对象池获取子弹
    const bullet = this.bulletPool.get();
    
    if (bullet) {
      // 随机生成位置（屏幕中心区域）
      const x = 300 + Math.random() * 200;
      const y = 200 + Math.random() * 200;
      
      // 激活子弹
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      bullet.setPosition(x, y);
      
      // 设置随机速度（8个方向）
      const angle = (Math.floor(Math.random() * 8) * 45) * Math.PI / 180;
      const speed = 150 + Math.random() * 100;
      bullet.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
      
      this.totalSpawned++;
      this.cycleCount++;
      
      this.logEvent('Bullet spawned', {
        position: { x: Math.floor(x), y: Math.floor(y) },
        velocity: { 
          x: Math.floor(bullet.body.velocity.x), 
          y: Math.floor(bullet.body.velocity.y) 
        },
        totalSpawned: this.totalSpawned
      });
    } else {
      // 对象池已满
      this.logEvent('Pool full - spawn failed', {
        activeCount: this.bulletPool.countActive(true)
      });
    }
  }

  update() {
    // 检查并回收超出边界的子弹
    this.bulletPool.children.entries.forEach(bullet => {
      if (bullet.active) {
        const bounds = this.physics.world.bounds;
        
        // 检查是否超出边界（带缓冲区）
        if (bullet.x < bounds.x - 50 || 
            bullet.x > bounds.x + bounds.width + 50 ||
            bullet.y < bounds.y - 50 || 
            bullet.y > bounds.y + bounds.height + 50) {
          
          this.recycleBullet(bullet);
        }
      }
    });
  }

  recycleBullet(bullet) {
    const pos = { x: Math.floor(bullet.x), y: Math.floor(bullet.y) };
    
    // 回收到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;
    bullet.setVelocity(0, 0);
    
    this.totalRecycled++;
    
    this.logEvent('Bullet recycled', {
      position: pos,
      totalRecycled: this.totalRecycled
    });
  }

  updateStatus() {
    const activeCount = this.bulletPool.countActive(true);
    const totalCount = this.bulletPool.getLength();
    
    // 更新显示文本
    this.statusText.setText([
      '=== Object Pool Stress Test ===',
      `Active Bullets: ${activeCount} / ${totalCount}`,
      `Pool Max Size: 12`,
      `Total Spawned: ${this.totalSpawned}`,
      `Total Recycled: ${this.totalRecycled}`,
      `Cycle Count: ${this.cycleCount}`,
      `Pool Efficiency: ${totalCount > 0 ? Math.floor(activeCount / totalCount * 100) : 0}%`
    ]);

    // 更新全局信号
    window.__signals__.activeCount = activeCount;
    window.__signals__.cycleCount = this.cycleCount;
    window.__signals__.totalSpawned = this.totalSpawned;
    window.__signals__.totalRecycled = this.totalRecycled;
    window.__signals__.poolEfficiency = totalCount > 0 ? 
      Math.floor(activeCount / totalCount * 100) : 0;
  }

  logEvent(event, data) {
    const timestamp = this.time.now;
    const logEntry = {
      time: Math.floor(timestamp),
      event: event,
      data: data
    };
    
    // 添加到日志数组（保留最近50条）
    window.__signals__.logs.push(logEntry);
    if (window.__signals__.logs.length > 50) {
      window.__signals__.logs.shift();
    }
    
    // 控制台输出
    console.log(`[${Math.floor(timestamp)}ms] ${event}:`, JSON.stringify(data));
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
  scene: BulletPoolScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 导出验证函数
window.getPoolStatus = function() {
  return {
    signals: window.__signals__,
    summary: {
      activeCount: window.__signals__.activeCount,
      totalSpawned: window.__signals__.totalSpawned,
      totalRecycled: window.__signals__.totalRecycled,
      efficiency: window.__signals__.poolEfficiency + '%'
    }
  };
};

console.log('Object Pool Stress Test Started');
console.log('Call window.getPoolStatus() to check current status');
console.log('Signals available at window.__signals__');
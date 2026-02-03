class PoolTestScene extends Phaser.Scene {
  constructor() {
    super('PoolTestScene');
    this.totalSpawned = 0; // 总生成次数
    this.recycleCount = 0; // 回收次数
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建紫色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9b59b6, 1); // 紫色
    graphics.fillCircle(8, 8, 8); // 半径8的圆形子弹
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建物理组作为对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 12, // 最大对象数限制为12
      runChildUpdate: false,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 创建显示信息的文本
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    this.infoText = this.add.text(10, 100, 
      '对象池压力测试\n每500ms生成一个子弹\n最大对象数: 12\n子弹超出屏幕自动回收', {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置定时器，每500ms生成一个子弹
    this.spawnTimer = this.time.addEvent({
      delay: 500,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 更新统计信息
    this.updateStats();
  }

  spawnBullet() {
    // 从对象池获取或创建子弹
    const bullet = this.bulletPool.get();
    
    if (bullet) {
      this.totalSpawned++;
      
      // 随机生成位置（使用确定性随机，基于totalSpawned作为种子）
      const seed = this.totalSpawned;
      const pseudoRandom = Math.abs(Math.sin(seed * 12345.6789));
      const x = 50 + pseudoRandom * 700; // 50-750之间
      const y = -20;
      
      // 激活并设置子弹
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setPosition(x, y);
      
      // 设置随机速度（基于种子）
      const speedRandom = Math.abs(Math.sin(seed * 98765.4321));
      const velocityX = (speedRandom - 0.5) * 100; // -50到50
      const velocityY = 150 + speedRandom * 100; // 150-250
      
      bullet.setVelocity(velocityX, velocityY);
      
      // 设置旋转
      bullet.setAngularVelocity(100);
    }
  }

  update(time, delta) {
    // 检查并回收超出屏幕的子弹
    this.bulletPool.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 如果子弹超出屏幕底部或左右边界
        if (bullet.y > 620 || bullet.x < -20 || bullet.x > 820) {
          this.recycleBullet(bullet);
        }
      }
    });

    // 更新统计信息
    this.updateStats();
  }

  recycleBullet(bullet) {
    this.recycleCount++;
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    bullet.setAngularVelocity(0);
  }

  updateStats() {
    const activeCount = this.bulletPool.countActive(true);
    const totalCount = this.bulletPool.getLength();
    
    this.statsText.setText([
      `活动对象数: ${activeCount}`,
      `对象池总数: ${totalCount}`,
      `总生成次数: ${this.totalSpawned}`,
      `回收次数: ${this.recycleCount}`,
      `池使用率: ${((activeCount / 12) * 100).toFixed(1)}%`
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: PoolTestScene
};

// 创建游戏实例
const game = new Phaser.Game(config);
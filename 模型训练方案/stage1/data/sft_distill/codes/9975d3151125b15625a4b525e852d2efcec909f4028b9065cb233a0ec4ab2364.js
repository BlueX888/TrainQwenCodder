class PoolTestScene extends Phaser.Scene {
  constructor() {
    super('PoolTestScene');
    this.spawnCount = 0; // 总生成次数
    this.activeCount = 0; // 当前活动对象数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建红色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建物理对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 15, // 对象池最大容量
      runChildUpdate: false,
      createCallback: (bullet) => {
        // 子弹创建回调
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 创建显示文本
    this.statusText = this.add.text(20, 20, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建说明文本
    this.add.text(20, 80, '对象池压力测试\n最大容量: 15\n生成间隔: 200ms', {
      fontSize: '14px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置定时器持续生成子弹
    this.spawnTimer = this.time.addEvent({
      delay: 200,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 更新显示
    this.updateStatus();
  }

  spawnBullet() {
    // 从对象池获取或创建子弹
    const bullet = this.bulletPool.get();
    
    if (bullet) {
      this.spawnCount++;
      
      // 激活子弹
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 随机位置和速度（使用确定性随机）
      const seed = this.spawnCount;
      const x = 50 + (seed * 137.508) % 700; // 伪随机 x 位置
      const y = 100 + (seed * 73.217) % 400; // 伪随机 y 位置
      const vx = 100 + (seed * 41.123) % 200; // 伪随机 x 速度
      const vy = -50 + (seed * 29.456) % 100; // 伪随机 y 速度
      
      bullet.setPosition(x, y);
      bullet.setVelocity(vx, vy);
      
      // 设置边界检测
      bullet.setCollideWorldBounds(false);
      
      this.updateStatus();
    }
  }

  update() {
    // 检查并回收超出边界的子弹
    this.bulletPool.getChildren().forEach((bullet) => {
      if (bullet.active) {
        // 子弹飞出屏幕边界时回收
        if (bullet.x < -50 || bullet.x > 850 || 
            bullet.y < -50 || bullet.y > 650) {
          this.recycleBullet(bullet);
        }
      }
    });
    
    this.updateStatus();
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
  }

  updateStatus() {
    // 计算当前活动对象数
    this.activeCount = this.bulletPool.countActive(true);
    
    // 更新显示
    this.statusText.setText([
      `总生成次数: ${this.spawnCount}`,
      `活动对象数: ${this.activeCount}`,
      `对象池大小: ${this.bulletPool.getLength()}`,
      `对象池利用率: ${((this.activeCount / 15) * 100).toFixed(1)}%`
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
  scene: PoolTestScene
};

new Phaser.Game(config);
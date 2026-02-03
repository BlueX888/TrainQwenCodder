class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.spawnCount = 0;
    this.recycleCount = 0;
    this.peakActive = 0;
  }

  preload() {
    // 创建粉色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建对象池 Group
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 8, // 最大 8 个对象
      runChildUpdate: true,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 创建信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 创建池状态文本
    this.poolStatusText = this.add.text(10, 120, '', {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 定时器：每 300ms 生成一个子弹
    this.spawnTimer = this.time.addEvent({
      delay: 300,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 更新显示
    this.updateDisplay();
  }

  spawnBullet() {
    // 从对象池获取子弹
    const bullet = this.bulletPool.get();
    
    if (bullet) {
      // 随机生成位置（屏幕左侧）
      const x = 50;
      const y = Phaser.Math.Between(50, 550);
      
      bullet.setPosition(x, y);
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityX(300); // 向右移动
      
      this.spawnCount++;
      
      // 更新峰值
      const activeCount = this.bulletPool.getChildren().filter(b => b.active).length;
      if (activeCount > this.peakActive) {
        this.peakActive = activeCount;
      }
    }
  }

  update() {
    // 检查并回收超出屏幕的子弹
    this.bulletPool.getChildren().forEach((bullet) => {
      if (bullet.active && bullet.x > 850) {
        this.recycleBullet(bullet);
      }
    });

    this.updateDisplay();
  }

  recycleBullet(bullet) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    this.recycleCount++;
  }

  updateDisplay() {
    const activeCount = this.bulletPool.getChildren().filter(b => b.active).length;
    const totalCount = this.bulletPool.getLength();
    
    this.infoText.setText([
      '=== 对象池压力测试 ===',
      `活动对象: ${activeCount} / ${this.bulletPool.maxSize}`,
      `总生成数: ${this.spawnCount}`,
      `总回收数: ${this.recycleCount}`,
      `峰值活动: ${this.peakActive}`
    ]);

    this.poolStatusText.setText([
      '=== 池状态 ===',
      `池大小: ${totalCount}`,
      `已用: ${activeCount}`,
      `可用: ${this.bulletPool.maxSize - activeCount}`,
      `利用率: ${((activeCount / this.bulletPool.maxSize) * 100).toFixed(1)}%`
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: BulletPoolScene
};

// 启动游戏
new Phaser.Game(config);
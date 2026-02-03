class PoolTestScene extends Phaser.Scene {
  constructor() {
    super('PoolTestScene');
    this.totalSpawned = 0; // 总生成次数
    this.recycleCount = 0; // 回收次数
  }

  preload() {
    // 创建蓝色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0088ff, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建物理组作为对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 8, // 对象池最大容量
      runChildUpdate: false,
      createCallback: (bullet) => {
        // 子弹创建时的回调
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 创建状态文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建说明文本
    this.add.text(10, 80, '对象池压力测试\n最大容量: 8 个子弹\n生成间隔: 500ms', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置定时器持续生成子弹
    this.spawnTimer = this.time.addEvent({
      delay: 500, // 每 500ms 生成一个
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 初始化状态
    this.updateStatus();
  }

  spawnBullet() {
    // 尝试从对象池获取或创建子弹
    let bullet = this.bulletPool.get();
    
    if (bullet) {
      // 随机生成位置（屏幕顶部）
      const x = Phaser.Math.Between(50, 750);
      const y = 0;
      
      // 激活子弹
      bullet.setPosition(x, y);
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置随机速度
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(100, 300);
      bullet.setVelocity(velocityX, velocityY);
      
      // 增加生成计数
      this.totalSpawned++;
      
      this.updateStatus();
    } else {
      // 对象池已满，无法生成新对象
      console.log('对象池已满，等待回收');
    }
  }

  update() {
    // 检查并回收超出屏幕的子弹
    this.bulletPool.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检查是否超出屏幕边界
        if (bullet.y > 620 || bullet.x < -20 || bullet.x > 820) {
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
    this.recycleCount++;
  }

  updateStatus() {
    // 计算活动对象数量
    const activeCount = this.bulletPool.countActive(true);
    const totalCount = this.bulletPool.getLength();
    
    // 更新状态显示
    this.statusText.setText([
      `活动对象: ${activeCount} / ${this.bulletPool.maxSize}`,
      `对象池总数: ${totalCount}`,
      `总生成次数: ${this.totalSpawned}`,
      `回收次数: ${this.recycleCount}`
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
  scene: PoolTestScene,
  seed: [(Date.now() * Math.random()).toString()] // 可配置随机种子
};

// 启动游戏
new Phaser.Game(config);
class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.activeCount = 0;
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 创建粉色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF1493, 1); // 粉色
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建对象池（使用物理组）
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 15,
      runChildUpdate: true
    });

    // 自定义子弹更新逻辑
    this.bulletPool.children.iterate = function(callback) {
      const entries = this.entries;
      for (let i = 0; i < entries.length; i++) {
        if (entries[i] && entries[i].active) {
          callback(entries[i]);
        }
      }
    };

    // 创建UI文本
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });
    this.statsText.setDepth(100);

    // 创建池状态文本
    this.poolText = this.add.text(10, 100, '', {
      fontSize: '16px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });
    this.poolText.setDepth(100);

    // 定时生成子弹（每300ms生成一个）
    this.spawnTimer = this.time.addEvent({
      delay: 300,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 添加说明文本
    this.add.text(400, 50, '对象池压力测试', {
      fontSize: '24px',
      fill: '#FFD700'
    }).setOrigin(0.5);

    this.add.text(400, 80, '持续生成15个粉色子弹，超出边界自动回收', {
      fontSize: '16px',
      fill: '#CCCCCC'
    }).setOrigin(0.5);

    this.updateStats();
  }

  spawnBullet() {
    // 从对象池获取或创建子弹
    let bullet = this.bulletPool.get();
    
    if (!bullet) {
      // 池已满，无法创建新对象
      console.log('Pool is full! Cannot spawn more bullets.');
      return;
    }

    // 设置子弹初始位置（随机Y位置）
    const randomY = Phaser.Math.Between(100, 500);
    bullet.setPosition(50, randomY);
    bullet.setActive(true);
    bullet.setVisible(true);

    // 设置子弹速度
    bullet.body.setVelocity(200, 0);
    
    // 添加自定义属性用于边界检测
    bullet.checkBounds = true;

    this.totalSpawned++;
    this.updateStats();
  }

  update(time, delta) {
    // 检查所有活动子弹
    this.bulletPool.children.entries.forEach(bullet => {
      if (bullet.active && bullet.checkBounds) {
        // 超出右边界时回收
        if (bullet.x > 800) {
          this.recycleBullet(bullet);
        }
      }
    });

    this.updateStats();
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.setVelocity(0, 0);
    bullet.checkBounds = false;
    
    this.totalRecycled++;
  }

  updateStats() {
    // 计算活动对象数量
    this.activeCount = this.bulletPool.countActive(true);
    
    // 更新统计文本
    this.statsText.setText([
      `活动对象数: ${this.activeCount}`,
      `总生成数: ${this.totalSpawned}`,
      `总回收数: ${this.totalRecycled}`,
      `池容量: ${this.bulletPool.maxSize}`
    ]);

    // 更新池状态
    const poolUsage = (this.activeCount / this.bulletPool.maxSize * 100).toFixed(1);
    this.poolText.setText([
      `池使用率: ${poolUsage}%`,
      `可用空间: ${this.bulletPool.maxSize - this.activeCount}`,
      `池状态: ${this.activeCount >= this.bulletPool.maxSize ? '已满' : '正常'}`
    ]);

    // 根据池状态改变颜色
    if (this.activeCount >= this.bulletPool.maxSize) {
      this.poolText.setColor('#ff0000');
    } else if (this.activeCount >= this.bulletPool.maxSize * 0.8) {
      this.poolText.setColor('#ffff00');
    } else {
      this.poolText.setColor('#00ff00');
    }
  }

  getState() {
    // 可验证的状态信号
    return {
      activeCount: this.activeCount,
      totalSpawned: this.totalSpawned,
      totalRecycled: this.totalRecycled,
      poolSize: this.bulletPool.maxSize,
      poolFull: this.activeCount >= this.bulletPool.maxSize
    };
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
  scene: BulletPoolScene
};

const game = new Phaser.Game(config);

// 可选：定期输出状态到控制台
setInterval(() => {
  const scene = game.scene.getScene('BulletPoolScene');
  if (scene && scene.getState) {
    const state = scene.getState();
    console.log('Pool State:', state);
  }
}, 2000);
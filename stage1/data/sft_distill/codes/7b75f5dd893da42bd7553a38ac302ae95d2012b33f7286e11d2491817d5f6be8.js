class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.totalSpawned = 0; // 总生成次数
    this.activeCount = 0;  // 当前活动数量
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
    // 创建对象池（物理组）
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 8, // 最大8个对象
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 创建显示文本
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建池信息文本
    this.poolInfoText = this.add.text(10, 60, '', {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时生成子弹（每0.5秒）
    this.spawnTimer = this.time.addEvent({
      delay: 500,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 初始化随机种子（确定性行为）
    Phaser.Math.RND.sow(['bullet-pool-test']);

    this.updateStats();
  }

  spawnBullet() {
    // 从对象池获取或创建子弹
    const bullet = this.bulletPool.get();
    
    if (bullet) {
      this.totalSpawned++;
      
      // 随机位置（屏幕顶部）
      const x = Phaser.Math.Between(50, 750);
      const y = 0;
      
      // 激活子弹
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setPosition(x, y);
      
      // 随机速度（向下和随机水平方向）
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(150, 300);
      bullet.setVelocity(velocityX, velocityY);
      
      // 添加旋转效果
      bullet.setAngularVelocity(Phaser.Math.Between(-180, 180));
    }
  }

  update(time, delta) {
    // 回收越界子弹
    this.bulletPool.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检查是否超出屏幕边界
        if (bullet.y > 620 || bullet.x < -20 || bullet.x > 820) {
          this.recycleBullet(bullet);
        }
      }
    });

    // 更新统计信息
    this.updateStats();
  }

  recycleBullet(bullet) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    bullet.setAngularVelocity(0);
  }

  updateStats() {
    // 计算当前活动对象数量
    this.activeCount = this.bulletPool.countActive(true);
    
    // 更新显示文本
    this.statsText.setText([
      `总生成次数: ${this.totalSpawned}`,
      `当前活动数: ${this.activeCount}`,
      `对象池大小: ${this.bulletPool.getLength()}`
    ]);

    // 显示对象池详细信息
    const totalInPool = this.bulletPool.getLength();
    const inactiveCount = totalInPool - this.activeCount;
    
    this.poolInfoText.setText([
      `池中总对象: ${totalInPool}`,
      `活动对象: ${this.activeCount}`,
      `可用对象: ${inactiveCount}`,
      `最大限制: ${this.bulletPool.maxSize}`
    ]);

    // 验证对象池未超出限制
    if (totalInPool > this.bulletPool.maxSize) {
      console.warn('对象池超出限制！');
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: BulletPoolScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出可验证的状态（用于测试）
game.getStats = function() {
  const scene = game.scene.scenes[0];
  return {
    totalSpawned: scene.totalSpawned,
    activeCount: scene.activeCount,
    poolSize: scene.bulletPool.getLength(),
    maxSize: scene.bulletPool.maxSize
  };
};
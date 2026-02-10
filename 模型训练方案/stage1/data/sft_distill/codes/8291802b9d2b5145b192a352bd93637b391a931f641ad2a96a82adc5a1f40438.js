class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.totalSpawned = 0;
    this.recycleCount = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建粉色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('pinkBullet', 16, 16);
    graphics.destroy();

    // 创建物理组作为对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'pinkBullet',
      maxSize: 15, // 最大15个对象
      runChildUpdate: true,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 预创建15个子弹对象
    for (let i = 0; i < 15; i++) {
      const bullet = this.bulletPool.create(0, 0, 'pinkBullet');
      bullet.setActive(false);
      bullet.setVisible(false);
    }

    // 显示统计信息
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 显示说明
    this.add.text(10, 100, '对象池压力测试\n每200ms生成一个粉色子弹\n最大池容量: 15个对象', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 10 }
    });

    // 定时生成子弹（每200ms）
    this.spawnTimer = this.time.addEvent({
      delay: 200,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 更新统计信息
    this.time.addEvent({
      delay: 50,
      callback: this.updateStats,
      callbackScope: this,
      loop: true
    });
  }

  spawnBullet() {
    // 从对象池获取子弹
    const bullet = this.bulletPool.get();
    
    if (bullet) {
      this.totalSpawned++;
      
      // 随机生成位置（顶部）
      const x = Phaser.Math.Between(50, 750);
      bullet.setPosition(x, 0);
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置随机速度（向下和随机水平方向）
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(150, 300);
      bullet.setVelocity(velocityX, velocityY);
      
      // 添加旋转效果
      bullet.setAngularVelocity(Phaser.Math.Between(-200, 200));
    }
  }

  update() {
    // 检查子弹是否超出边界，超出则回收
    this.bulletPool.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 超出屏幕底部或左右边界
        if (bullet.y > 650 || bullet.x < -50 || bullet.x > 850) {
          this.recycleBullet(bullet);
        }
      }
    });
  }

  recycleBullet(bullet) {
    this.recycleCount++;
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    bullet.setAngularVelocity(0);
    bullet.setPosition(0, 0);
  }

  updateStats() {
    const activeCount = this.bulletPool.countActive(true);
    const inactiveCount = this.bulletPool.countActive(false);
    const totalCount = this.bulletPool.getLength();
    
    this.statsText.setText([
      `活动对象: ${activeCount}`,
      `池中待用: ${inactiveCount}`,
      `池总容量: ${totalCount}`,
      `总生成次数: ${this.totalSpawned}`,
      `回收次数: ${this.recycleCount}`,
      `池利用率: ${((activeCount / 15) * 100).toFixed(1)}%`
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
  scene: BulletPoolScene
};

new Phaser.Game(config);
class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.totalSpawned = 0;
    this.totalRecycled = 0;
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

    // 创建物理对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'pinkBullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 创建信息文本
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 定时生成子弹（每 500ms 生成 8 个）
    this.spawnTimer = this.time.addEvent({
      delay: 500,
      callback: this.spawnBullets,
      callbackScope: this,
      loop: true
    });

    // 更新统计信息
    this.updateStats();
  }

  spawnBullets() {
    const bulletCount = 8;
    
    for (let i = 0; i < bulletCount; i++) {
      // 从对象池获取或创建子弹
      let bullet = this.bulletPool.get();
      
      if (bullet) {
        // 随机 X 位置
        const x = Phaser.Math.Between(50, 750);
        const y = -20;
        
        // 激活并设置位置
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setPosition(x, y);
        bullet.setVelocityY(Phaser.Math.Between(150, 300)); // 随机下落速度
        
        this.totalSpawned++;
      }
    }
  }

  update(time, delta) {
    // 检查并回收超出屏幕的子弹
    this.bulletPool.children.entries.forEach((bullet) => {
      if (bullet.active && bullet.y > 620) {
        this.recycleBullet(bullet);
      }
    });

    // 更新统计信息
    this.updateStats();
  }

  recycleBullet(bullet) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    this.totalRecycled++;
  }

  updateStats() {
    const activeCount = this.bulletPool.countActive(true);
    const poolSize = this.bulletPool.getLength();
    
    this.statsText.setText([
      '=== 对象池压力测试 ===',
      `活动对象数: ${activeCount}`,
      `对象池大小: ${poolSize}`,
      `总生成次数: ${this.totalSpawned}`,
      `总回收次数: ${this.totalRecycled}`,
      `内存效率: ${poolSize <= 50 ? '正常' : '超限'}`
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
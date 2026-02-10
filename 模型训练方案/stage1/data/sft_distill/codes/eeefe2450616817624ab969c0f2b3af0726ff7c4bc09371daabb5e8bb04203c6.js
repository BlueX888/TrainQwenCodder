class PoolTestScene extends Phaser.Scene {
  constructor() {
    super('PoolTestScene');
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建子弹纹理（绿色圆形）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建物理组作为对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20,  // 对象池最大容量
      runChildUpdate: true,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 创建显示文本
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建提示文本
    this.add.text(10, 80, '对象池容量: 20\n生成间隔: 200ms\n子弹速度: 200px/s', {
      fontSize: '14px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时生成子弹（每200ms生成一个）
    this.spawnTimer = this.time.addEvent({
      delay: 200,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 更新统计信息
    this.updateStats();
  }

  spawnBullet() {
    // 从对象池获取或创建子弹
    let bullet = this.bulletPool.get();

    if (bullet) {
      // 随机生成位置（屏幕左侧）
      const randomY = Phaser.Math.Between(50, 550);
      
      bullet.setPosition(50, randomY);
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      
      // 设置速度（向右移动）
      bullet.setVelocity(200, 0);
      
      this.totalSpawned++;
      this.updateStats();
    } else {
      // 对象池已满，无法获取新对象
      console.log('对象池已满，无法生成新子弹');
    }
  }

  update() {
    // 检查并回收超出屏幕的子弹
    this.bulletPool.children.entries.forEach((bullet) => {
      if (bullet.active && bullet.x > 850) {
        this.recycleBullet(bullet);
      }
    });

    this.updateStats();
  }

  recycleBullet(bullet) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;
    bullet.setVelocity(0, 0);
    
    this.totalRecycled++;
  }

  updateStats() {
    const activeCount = this.bulletPool.countActive(true);
    const totalCount = this.bulletPool.getLength();
    
    this.statsText.setText([
      `活动对象: ${activeCount} / ${totalCount}`,
      `总生成数: ${this.totalSpawned}`,
      `总回收数: ${this.totalRecycled}`,
      `池利用率: ${((activeCount / 20) * 100).toFixed(1)}%`
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
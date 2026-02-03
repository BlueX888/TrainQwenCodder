class PoolTestScene extends Phaser.Scene {
  constructor() {
    super('PoolTestScene');
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 创建绿色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 12,
      runChildUpdate: true
    });

    // 创建显示文本
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建定时器，每500ms生成一个子弹
    this.spawnTimer = this.time.addEvent({
      delay: 500,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 更新显示
    this.updateStats();
  }

  spawnBullet() {
    // 从对象池获取或创建子弹
    let bullet = this.bulletPool.get();
    
    if (bullet) {
      // 随机位置（使用固定种子的伪随机）
      const seedX = (this.totalSpawned * 137.5) % 800;
      const seedY = 50 + ((this.totalSpawned * 89.3) % 100);
      
      bullet.setPosition(seedX, seedY);
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置随机速度（确定性随机）
      const velocityX = ((this.totalSpawned * 73.2) % 200) - 100;
      const velocityY = 100 + ((this.totalSpawned * 53.7) % 100);
      bullet.setVelocity(velocityX, velocityY);
      
      this.totalSpawned++;
      this.updateStats();
    }
  }

  update() {
    // 检查并回收超出边界的子弹
    this.bulletPool.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.y > 650 || bullet.x < -50 || bullet.x > 850 || bullet.y < -50) {
          this.recycleBullet(bullet);
        }
      }
    });
  }

  recycleBullet(bullet) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    this.totalRecycled++;
    this.updateStats();
  }

  updateStats() {
    const activeCount = this.bulletPool.countActive(true);
    const poolSize = this.bulletPool.getLength();
    
    this.statsText.setText([
      `Active Objects: ${activeCount}`,
      `Pool Size: ${poolSize}`,
      `Max Size: 12`,
      `Total Spawned: ${this.totalSpawned}`,
      `Total Recycled: ${this.totalRecycled}`,
      `Net Objects: ${this.totalSpawned - this.totalRecycled}`
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
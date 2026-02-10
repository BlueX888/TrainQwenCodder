class PoolTestScene extends Phaser.Scene {
  constructor() {
    super('PoolTestScene');
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 使用 Graphics 创建子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 10, // 最大 10 个对象
      runChildUpdate: false,
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
      padding: { x: 10, y: 10 }
    });

    // 定时生成子弹（每 300ms 生成一个）
    this.spawnTimer = this.time.addEvent({
      delay: 300,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 更新统计信息
    this.updateStats();
  }

  spawnBullet() {
    // 从对象池获取子弹
    const bullet = this.bulletPool.get();
    
    if (bullet) {
      // 随机位置生成（使用固定种子的伪随机）
      const x = 100 + (this.totalSpawned * 73) % 600; // 确定性位置
      const y = 50;
      
      bullet.setPosition(x, y);
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置向下运动
      bullet.setVelocityY(150);
      
      this.totalSpawned++;
      
      // 设置自动回收（2 秒后回收）
      this.time.delayedCall(2000, () => {
        this.recycleBullet(bullet);
      });
    }
  }

  recycleBullet(bullet) {
    if (bullet.active) {
      bullet.setActive(false);
      bullet.setVisible(false);
      bullet.setVelocity(0, 0);
      this.totalRecycled++;
    }
  }

  update(time, delta) {
    // 检查子弹是否超出边界，自动回收
    this.bulletPool.getChildren().forEach(bullet => {
      if (bullet.active && bullet.y > 650) {
        this.recycleBullet(bullet);
      }
    });

    // 更新统计信息
    this.updateStats();
  }

  updateStats() {
    const activeCount = this.bulletPool.countActive(true);
    const totalCount = this.bulletPool.getLength();
    
    this.statsText.setText([
      `=== 对象池压力测试 ===`,
      `活动对象数: ${activeCount}`,
      `池中总对象: ${totalCount}`,
      `最大容量: ${this.bulletPool.maxSize}`,
      `总生成次数: ${this.totalSpawned}`,
      `总回收次数: ${this.totalRecycled}`,
      ``,
      `状态: ${activeCount === this.bulletPool.maxSize ? '池已满' : '正常运行'}`
    ].join('\n'));
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
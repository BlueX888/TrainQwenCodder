class PoolTestScene extends Phaser.Scene {
  constructor() {
    super('PoolTestScene');
    this.spawnCount = 0;
    this.recycleCount = 0;
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
    // 创建物理对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 8, // 最大8个对象
      runChildUpdate: true
    });

    // 创建显示文本
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时生成子弹（每500ms）
    this.time.addEvent({
      delay: 500,
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
      this.spawnCount++;
      
      // 随机生成位置（屏幕中央区域）
      const x = Phaser.Math.Between(200, 600);
      const y = Phaser.Math.Between(100, 500);
      
      // 激活并设置位置
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setPosition(x, y);
      
      // 设置随机速度
      const angle = Phaser.Math.Between(0, 360);
      const speed = Phaser.Math.Between(100, 300);
      this.physics.velocityFromAngle(angle, speed, bullet.body.velocity);
      
      // 添加自定义更新逻辑
      bullet.update = () => {
        // 检查是否超出屏幕边界
        if (bullet.x < -50 || bullet.x > 850 || 
            bullet.y < -50 || bullet.y > 650) {
          this.recycleBullet(bullet);
        }
      };
    }
  }

  recycleBullet(bullet) {
    if (bullet.active) {
      this.recycleCount++;
      
      // 停止运动
      bullet.body.setVelocity(0, 0);
      
      // 回收到对象池
      this.bulletPool.killAndHide(bullet);
      bullet.setActive(false);
    }
  }

  update() {
    this.updateStats();
  }

  updateStats() {
    const activeCount = this.bulletPool.getLength();
    const totalInPool = this.bulletPool.getChildren().length;
    
    this.statsText.setText([
      '=== 对象池压力测试 ===',
      `活动对象数: ${activeCount} / 8`,
      `对象池总数: ${totalInPool}`,
      `已生成次数: ${this.spawnCount}`,
      `已回收次数: ${this.recycleCount}`,
      `内存复用率: ${this.recycleCount > 0 ? 
        ((this.recycleCount / this.spawnCount) * 100).toFixed(1) : 0}%`
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
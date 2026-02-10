class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.totalSpawned = 0;
    this.totalRecycled = 0;
    this.spawnCount = 0;
  }

  preload() {
    // 创建黄色子弹纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xFFFF00, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建对象池（Physics Group）
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 12,
      runChildUpdate: false
    });

    // 显示信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 活动对象计数文本
    this.activeText = this.add.text(10, 80, '', {
      fontSize: '24px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 统计信息文本
    this.statsText = this.add.text(10, 140, '', {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 定时生成子弹（每500ms）
    this.spawnTimer = this.time.addEvent({
      delay: 500,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 初始化显示
    this.updateDisplay();
  }

  spawnBullet() {
    // 检查是否达到最大数量
    const activeCount = this.bulletPool.getLength();
    
    if (activeCount < 12) {
      // 从对象池获取或创建子弹
      const bullet = this.bulletPool.get(50, Phaser.Math.Between(100, 500));
      
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.body.setVelocityX(200);
        
        this.totalSpawned++;
        this.spawnCount++;
        
        // 添加出界检测
        bullet.checkWorldBounds = true;
        bullet.outOfBoundsKill = false;
      }
    } else {
      // 达到上限，开始回收最早的子弹
      const bullets = this.bulletPool.getChildren();
      if (bullets.length > 0) {
        const oldestBullet = bullets[0];
        this.recycleBullet(oldestBullet);
      }
    }
  }

  recycleBullet(bullet) {
    if (bullet && bullet.active) {
      bullet.setActive(false);
      bullet.setVisible(false);
      bullet.body.setVelocity(0, 0);
      bullet.x = 50;
      this.totalRecycled++;
    }
  }

  update(time, delta) {
    // 检查子弹是否超出边界
    const bullets = this.bulletPool.getChildren();
    bullets.forEach(bullet => {
      if (bullet.active && bullet.x > 800) {
        this.recycleBullet(bullet);
      }
    });

    // 更新显示
    this.updateDisplay();
  }

  updateDisplay() {
    const activeCount = this.bulletPool.getLength();
    const totalInPool = this.bulletPool.getChildren().length;
    
    this.infoText.setText([
      '对象池压力测试',
      '按 R 重置统计',
      `池容量: ${totalInPool} / 12`
    ]);

    this.activeText.setText(`活动对象: ${activeCount}`);

    this.statsText.setText([
      `总生成: ${this.totalSpawned}`,
      `总回收: ${this.totalRecycled}`,
      `净增长: ${this.totalSpawned - this.totalRecycled}`,
      `当前批次: ${this.spawnCount}`
    ]);

    // 添加重置功能
    if (!this.resetKey) {
      this.resetKey = this.input.keyboard.addKey('R');
      this.resetKey.on('down', () => {
        this.totalSpawned = 0;
        this.totalRecycled = 0;
        this.spawnCount = 0;
        
        // 清空所有子弹
        this.bulletPool.clear(true, true);
      });
    }
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
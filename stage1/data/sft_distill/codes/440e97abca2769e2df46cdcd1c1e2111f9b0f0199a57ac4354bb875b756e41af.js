class PoolTestScene extends Phaser.Scene {
  constructor() {
    super('PoolTestScene');
    this.activeCount = 0;
    this.recycleCount = 0;
    this.spawnCount = 0;
  }

  preload() {
    // 创建子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建对象池（使用物理组）
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 12,
      runChildUpdate: false,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 创建显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建提示文本
    this.add.text(10, 80, '对象池压力测试\n每500ms生成一个子弹\n最大对象数: 12\n子弹飞出屏幕后回收', {
      fontSize: '14px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时生成子弹
    this.time.addEvent({
      delay: 500,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 更新状态显示
    this.updateStatus();
  }

  spawnBullet() {
    // 从对象池获取或创建子弹
    let bullet = this.bulletPool.get();

    if (bullet) {
      // 随机生成位置（屏幕左侧）
      const startY = Phaser.Math.Between(50, 550);
      
      bullet.setPosition(50, startY);
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityX(200);
      bullet.setVelocityY(Phaser.Math.Between(-50, 50));

      this.spawnCount++;
      this.activeCount = this.bulletPool.countActive(true);
      this.updateStatus();
    }
  }

  update(time, delta) {
    // 检查并回收飞出屏幕的子弹
    this.bulletPool.children.entries.forEach((bullet) => {
      if (bullet.active && bullet.x > 850) {
        this.recycleBullet(bullet);
      }
    });
  }

  recycleBullet(bullet) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    
    this.recycleCount++;
    this.activeCount = this.bulletPool.countActive(true);
    this.updateStatus();
  }

  updateStatus() {
    const poolSize = this.bulletPool.getLength();
    const activeObjects = this.bulletPool.countActive(true);
    const inactiveObjects = this.bulletPool.countActive(false);

    this.statusText.setText([
      `活动对象: ${activeObjects}`,
      `池中对象: ${inactiveObjects}`,
      `总对象数: ${poolSize}`,
      `已生成: ${this.spawnCount}`,
      `已回收: ${this.recycleCount}`
    ]);

    // 验证状态
    this.activeCount = activeObjects;
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
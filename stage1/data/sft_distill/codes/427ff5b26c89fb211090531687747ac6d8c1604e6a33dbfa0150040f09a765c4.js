class PoolTestScene extends Phaser.Scene {
  constructor() {
    super('PoolTestScene');
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 使用 Graphics 创建子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建对象池（Physics Group）
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 12, // 对象池最大容量
      runChildUpdate: false,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 创建显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 设置定时器持续生成子弹
    this.spawnTimer = this.time.addEvent({
      delay: 200, // 每200ms生成一个
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 更新显示
    this.updateStatus();
  }

  spawnBullet() {
    // 从对象池获取子弹
    let bullet = this.bulletPool.get();

    if (bullet) {
      // 随机生成位置（屏幕左侧）
      const randomY = Phaser.Math.Between(50, 550);
      
      bullet.setPosition(50, randomY);
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置速度向右移动
      bullet.body.setVelocity(200, 0);
      
      this.totalSpawned++;
      this.updateStatus();
    } else {
      // 对象池已满，无法获取新对象
      console.log('Pool is full, cannot spawn more bullets');
    }
  }

  update() {
    // 检查并回收超出屏幕的子弹
    this.bulletPool.children.entries.forEach((bullet) => {
      if (bullet.active && bullet.x > 850) {
        this.recycleBullet(bullet);
      }
    });

    this.updateStatus();
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.setVelocity(0, 0);
    
    this.totalRecycled++;
  }

  updateStatus() {
    // 获取当前活动对象数量
    const activeCount = this.bulletPool.countActive(true);
    const totalCount = this.bulletPool.getLength();
    
    this.statusText.setText([
      '=== 对象池压力测试 ===',
      `池容量: ${this.bulletPool.maxSize}`,
      `活动对象: ${activeCount}`,
      `池中总对象: ${totalCount}`,
      `总生成: ${this.totalSpawned}`,
      `总回收: ${this.totalRecycled}`,
      `生成速率: 5/秒`,
      '',
      '绿色圆点 = 子弹对象'
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
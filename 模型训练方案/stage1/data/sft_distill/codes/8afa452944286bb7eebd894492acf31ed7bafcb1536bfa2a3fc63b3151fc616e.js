class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.totalSpawned = 0;
    this.activeCount = 0;
  }

  preload() {
    // 使用 Graphics 创建粉色子弹纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff1493, 1); // 粉色
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建物理组作为对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 15, // 最大15个对象
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 创建信息显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建说明文本
    this.add.text(10, 70, '对象池压力测试\n最大容量: 15\n生成速率: 每200ms\n回收条件: 超出边界', {
      fontSize: '14px',
      color: '#ffff00',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    });

    // 定时生成子弹 (每200ms生成一个)
    this.spawnTimer = this.time.addEvent({
      delay: 200,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 更新显示计数器
    this.updateCounter = this.time.addEvent({
      delay: 50,
      callback: this.updateStatus,
      callbackScope: this,
      loop: true
    });
  }

  spawnBullet() {
    // 从对象池获取或创建子弹
    const bullet = this.bulletPool.get();
    
    if (bullet) {
      // 随机生成位置（使用确定性随机）
      const seed = this.totalSpawned;
      const x = 50 + (seed * 137.5) % 700; // 伪随机x位置
      const y = 100 + (seed * 73.3) % 100; // 伪随机y位置
      
      // 激活子弹
      bullet.setPosition(x, y);
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置速度（向下和随机水平方向）
      const velocityX = ((seed * 17) % 200) - 100; // -100 到 100
      bullet.setVelocity(velocityX, 150);
      
      this.totalSpawned++;
    }
  }

  updateStatus() {
    // 统计活动对象数量
    this.activeCount = this.bulletPool.getChildren().filter(
      bullet => bullet.active
    ).length;

    // 更新显示
    this.statusText.setText([
      `活动对象: ${this.activeCount} / 15`,
      `总生成数: ${this.totalSpawned}`,
      `池大小: ${this.bulletPool.getLength()}`
    ]);
  }

  update() {
    // 回收超出边界的子弹
    this.bulletPool.getChildren().forEach(bullet => {
      if (bullet.active) {
        // 检查是否超出边界
        if (bullet.y > 620 || bullet.x < -20 || bullet.x > 820) {
          // 回收到对象池
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.setVelocity(0, 0);
        }
      }
    });
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
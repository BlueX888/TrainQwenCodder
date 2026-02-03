class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.activeCount = 0;
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 创建紫色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932cc, 1); // 紫色
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建物理组作为对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 12, // 对象池最大容量
      runChildUpdate: true,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 创建信息显示文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 创建边界指示器
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 0.5);
    graphics.strokeRect(0, 0, 800, 600);

    // 定时器：每300ms生成一个子弹
    this.spawnTimer = this.time.addEvent({
      delay: 300,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 更新显示信息
    this.updateInfo();
  }

  spawnBullet() {
    // 从对象池获取或创建子弹
    let bullet = this.bulletPool.get();
    
    if (bullet) {
      // 随机生成位置（使用确定性随机）
      const spawnX = 50 + (this.totalSpawned * 137) % 700; // 伪随机X
      const spawnY = 50;
      
      // 激活子弹
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setPosition(spawnX, spawnY);
      
      // 设置随机速度
      const velocityX = ((this.totalSpawned * 73) % 200) - 100; // -100 到 100
      const velocityY = 150 + ((this.totalSpawned * 53) % 150); // 150 到 300
      bullet.setVelocity(velocityX, velocityY);
      
      this.totalSpawned++;
      this.updateInfo();
    }
  }

  update() {
    // 检查并回收超出边界的子弹
    this.bulletPool.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检查是否超出边界
        if (bullet.x < -20 || bullet.x > 820 || 
            bullet.y < -20 || bullet.y > 620) {
          this.recycleBullet(bullet);
        }
      }
    });

    this.updateInfo();
  }

  recycleBullet(bullet) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    this.totalRecycled++;
  }

  updateInfo() {
    // 计算当前活动对象数
    this.activeCount = this.bulletPool.countActive(true);
    
    // 计算池中总对象数
    const totalInPool = this.bulletPool.getLength();
    
    // 更新显示文本
    this.infoText.setText([
      '=== 对象池压力测试 ===',
      `活动对象: ${this.activeCount} / ${this.bulletPool.maxSize}`,
      `池中总数: ${totalInPool}`,
      `已生成: ${this.totalSpawned}`,
      `已回收: ${this.totalRecycled}`,
      `池状态: ${this.activeCount === this.bulletPool.maxSize ? '已满' : '正常'}`,
      '',
      '紫色子弹会在超出边界后自动回收'
    ]);
  }
}

// 游戏配置
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

// 启动游戏
new Phaser.Game(config);
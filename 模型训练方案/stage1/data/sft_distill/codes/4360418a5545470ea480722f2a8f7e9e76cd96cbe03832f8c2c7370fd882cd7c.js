class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建黄色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建物理对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 12,
      runChildUpdate: true
    });

    // 状态信号变量
    this.activeCount = 0;
    this.poolSize = 12;

    // 创建UI文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 创建边界线（可视化）
    const boundaryGraphics = this.add.graphics();
    boundaryGraphics.lineStyle(2, 0xff0000, 1);
    boundaryGraphics.strokeRect(50, 50, 700, 500);

    // 定时生成子弹（每500ms生成一个）
    this.spawnTimer = this.time.addEvent({
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
    let bullet = this.bulletPool.get(
      Phaser.Math.Between(100, 700),
      Phaser.Math.Between(100, 500)
    );

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置随机速度
      const angle = Phaser.Math.Between(0, 360);
      const speed = 200;
      bullet.setVelocity(
        Math.cos(angle * Math.PI / 180) * speed,
        Math.sin(angle * Math.PI / 180) * speed
      );

      // 添加自定义更新方法
      bullet.update = () => {
        // 检查是否超出边界
        if (bullet.x < 50 || bullet.x > 750 || 
            bullet.y < 50 || bullet.y > 550) {
          this.recycleBullet(bullet);
        }
      };

      this.totalSpawned++;
      this.updateStatus();
    }
  }

  recycleBullet(bullet) {
    if (bullet.active) {
      bullet.setActive(false);
      bullet.setVisible(false);
      bullet.setVelocity(0, 0);
      bullet.update = null;
      
      this.totalRecycled++;
      this.updateStatus();
    }
  }

  updateStatus() {
    // 获取当前活动对象数量
    this.activeCount = this.bulletPool.getChildren().filter(child => child.active).length;
    
    const statusInfo = [
      `对象池压力测试`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `池容量: ${this.poolSize}`,
      `活动对象: ${this.activeCount}`,
      `总生成: ${this.totalSpawned}`,
      `总回收: ${this.totalRecycled}`,
      `池使用率: ${Math.round(this.activeCount / this.poolSize * 100)}%`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `验证: ${this.activeCount <= this.poolSize ? '✓ 正常' : '✗ 异常'}`
    ];

    this.statusText.setText(statusInfo.join('\n'));
  }

  update(time, delta) {
    // 更新所有活动子弹
    this.bulletPool.getChildren().forEach(bullet => {
      if (bullet.active && bullet.update) {
        bullet.update();
      }
    });

    // 实时更新状态
    this.updateStatus();
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
// 对象池压力测试 - 红色子弹生成与回收
class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.totalSpawned = 0; // 总生成数量
    this.activeCount = 0; // 当前活动对象数
    this.recycledCount = 0; // 已回收数量
  }

  preload() {
    // 创建红色子弹纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 15, // 最大容量15个
      runChildUpdate: false,
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

    // 创建边界提示
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0x00ff00, 0.5);
    bounds.strokeRect(0, 0, 800, 600);

    // 每 200ms 生成一个子弹
    this.time.addEvent({
      delay: 200,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 更新显示信息
    this.time.addEvent({
      delay: 50,
      callback: this.updateInfo,
      callbackScope: this,
      loop: true
    });

    // 添加说明文字
    this.add.text(10, 550, '对象池压力测试：最多15个活动对象，超出边界自动回收', {
      fontSize: '14px',
      color: '#ffff00'
    });
  }

  spawnBullet() {
    // 从对象池获取或创建子弹
    let bullet = this.bulletPool.get();
    
    if (!bullet) {
      // 池已满，无法创建新对象
      return;
    }

    // 随机生成位置（顶部）
    const x = Phaser.Math.Between(50, 750);
    const y = 0;

    // 激活子弹
    bullet.setPosition(x, y);
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 设置随机速度
    const velocityX = Phaser.Math.Between(-100, 100);
    const velocityY = Phaser.Math.Between(100, 300);
    bullet.setVelocity(velocityX, velocityY);

    // 设置碰撞边界
    bullet.setCollideWorldBounds(false);

    this.totalSpawned++;
  }

  update(time, delta) {
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
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    this.recycledCount++;
  }

  updateInfo() {
    // 计算当前活动对象数
    this.activeCount = this.bulletPool.countActive(true);
    
    // 更新显示信息
    const info = [
      `总生成数量: ${this.totalSpawned}`,
      `当前活动对象: ${this.activeCount}`,
      `已回收数量: ${this.recycledCount}`,
      `对象池容量: ${this.bulletPool.maxSize}`,
      `池使用率: ${((this.activeCount / this.bulletPool.maxSize) * 100).toFixed(1)}%`
    ].join('\n');
    
    this.infoText.setText(info);

    // 验证状态信号
    console.log(`[State] Active: ${this.activeCount}, Total: ${this.totalSpawned}, Recycled: ${this.recycledCount}`);
  }

  // 获取状态信号（用于验证）
  getState() {
    return {
      totalSpawned: this.totalSpawned,
      activeCount: this.activeCount,
      recycledCount: this.recycledCount,
      poolMaxSize: this.bulletPool.maxSize
    };
  }
}

// Phaser 游戏配置
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
  scene: BulletPoolScene,
  seed: [42] // 固定随机种子，保证行为确定性
};

// 启动游戏
const game = new Phaser.Game(config);

// 暴露状态查询接口（用于测试验证）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return scene ? scene.getState() : null;
};
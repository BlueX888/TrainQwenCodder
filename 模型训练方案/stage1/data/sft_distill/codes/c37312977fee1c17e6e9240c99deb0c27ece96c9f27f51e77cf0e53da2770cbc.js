class BulletPoolScene extends Phaser.Scene {
  constructor() {
    super('BulletPoolScene');
    this.activeCount = 0;
    this.totalSpawned = 0;
    this.totalRecycled = 0;
  }

  preload() {
    // 创建灰色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建物理组作为对象池
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 10,
      runChildUpdate: true
    });

    // 自定义子弹更新逻辑
    this.bulletPool.children.iterate = function(callback) {
      const entries = this.entries;
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].active) {
          callback(entries[i]);
        }
      }
    };

    // 创建信息显示文本
    this.infoText = this.add.text(20, 20, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 创建说明文本
    this.add.text(20, 150, '对象池压力测试\n每0.3秒生成一个子弹\n池大小: 10\n子弹向右移动，出屏幕后回收', {
      fontSize: '14px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 定时生成子弹（每300ms生成一个）
    this.time.addEvent({
      delay: 300,
      callback: this.spawnBullet,
      callbackScope: this,
      loop: true
    });

    // 更新显示信息
    this.time.addEvent({
      delay: 100,
      callback: this.updateInfo,
      callbackScope: this,
      loop: true
    });
  }

  spawnBullet() {
    // 从对象池获取子弹
    const bullet = this.bulletPool.get();
    
    if (bullet) {
      // 设置子弹初始位置（屏幕左侧随机高度）
      const randomY = Phaser.Math.Between(100, 500);
      bullet.setPosition(50, randomY);
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置速度
      bullet.body.setVelocity(200, 0);
      
      // 记录生成数量
      this.totalSpawned++;
      
      // 添加自定义更新方法
      bullet.update = () => {
        // 子弹超出屏幕右侧时回收
        if (bullet.x > 850) {
          this.recycleBullet(bullet);
        }
      };
    }
  }

  recycleBullet(bullet) {
    if (bullet.active) {
      bullet.setActive(false);
      bullet.setVisible(false);
      bullet.body.setVelocity(0, 0);
      this.totalRecycled++;
      
      // 将子弹放回池中
      this.bulletPool.killAndHide(bullet);
    }
  }

  updateInfo() {
    // 统计当前活动对象数量
    this.activeCount = 0;
    this.bulletPool.children.entries.forEach(bullet => {
      if (bullet.active) {
        this.activeCount++;
      }
    });

    // 更新显示信息
    this.infoText.setText([
      `活动对象数: ${this.activeCount}`,
      `池总大小: ${this.bulletPool.maxSize}`,
      `累计生成: ${this.totalSpawned}`,
      `累计回收: ${this.totalRecycled}`,
      `池利用率: ${((this.activeCount / this.bulletPool.maxSize) * 100).toFixed(1)}%`
    ]);
  }

  update() {
    // 手动调用每个活动子弹的update方法
    this.bulletPool.children.entries.forEach(bullet => {
      if (bullet.active && bullet.update) {
        bullet.update();
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
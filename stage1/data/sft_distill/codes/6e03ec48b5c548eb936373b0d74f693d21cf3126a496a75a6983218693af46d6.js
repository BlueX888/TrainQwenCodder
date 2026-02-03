class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.recycledCount = 0;    // 已回收对象总数
    this.spawnedCount = 0;     // 已生成对象总数
  }

  preload() {
    // 创建黄色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('yellowBall', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'yellowBall',
      maxSize: 15,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 初始化对象池中的对象
    for (let i = 0; i < 15; i++) {
      const obj = this.objectPool.create(0, 0, 'yellowBall');
      obj.setActive(false);
      obj.setVisible(false);
    }

    // 定时生成对象（每 800ms 生成一个）
    this.time.addEvent({
      delay: 800,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界线（用于视觉参考）
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0x00ff00, 1);
    bounds.strokeRect(0, 0, 800, 600);
  }

  spawnObject() {
    // 从对象池获取未激活的对象
    const obj = this.objectPool.getFirstDead(false);
    
    if (obj) {
      // 随机生成位置（从顶部或左侧）
      const spawnSide = Phaser.Math.Between(0, 1);
      let x, y, velocityX, velocityY;

      if (spawnSide === 0) {
        // 从顶部生成
        x = Phaser.Math.Between(50, 750);
        y = -20;
        velocityX = Phaser.Math.Between(-100, 100);
        velocityY = Phaser.Math.Between(100, 200);
      } else {
        // 从左侧生成
        x = -20;
        y = Phaser.Math.Between(50, 550);
        velocityX = Phaser.Math.Between(100, 200);
        velocityY = Phaser.Math.Between(-100, 100);
      }

      // 激活对象
      obj.setPosition(x, y);
      obj.setActive(true);
      obj.setVisible(true);
      obj.setVelocity(velocityX, velocityY);
      
      this.spawnedCount++;
      this.activeCount = this.objectPool.countActive(true);
    }
  }

  update() {
    // 检查所有活跃对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检查对象是否离开屏幕边界（带缓冲区）
        const buffer = 50;
        if (obj.x < -buffer || obj.x > 800 + buffer ||
            obj.y < -buffer || obj.y > 600 + buffer) {
          // 回收对象
          this.recycleObject(obj);
        }
      }
    });

    // 更新状态显示
    this.activeCount = this.objectPool.countActive(true);
    const poolSize = this.objectPool.getLength();
    
    this.statusText.setText([
      `Pool Size: ${poolSize}`,
      `Active Objects: ${this.activeCount}`,
      `Spawned Total: ${this.spawnedCount}`,
      `Recycled Total: ${this.recycledCount}`,
      `Available: ${poolSize - this.activeCount}`
    ]);
  }

  recycleObject(obj) {
    // 停止对象移动
    obj.setVelocity(0, 0);
    
    // 禁用对象
    obj.setActive(false);
    obj.setVisible(false);
    
    // 增加回收计数
    this.recycledCount++;
    this.activeCount = this.objectPool.countActive(true);
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
  scene: PoolScene
};

// 创建游戏实例
const game = new Phaser.Game(config);
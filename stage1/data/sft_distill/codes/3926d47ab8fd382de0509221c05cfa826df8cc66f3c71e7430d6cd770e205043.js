class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.recycledCount = 0;    // 总回收次数
    this.spawnedCount = 0;     // 总发射次数
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
    // 创建对象池，最大 8 个对象
    this.objectPool = this.physics.add.group({
      defaultKey: 'yellowBall',
      maxSize: 8,
      runChildUpdate: false
    });

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时发射对象（每 800ms 发射一个）
    this.time.addEvent({
      delay: 800,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 初始发射 3 个对象
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 300, () => this.spawnObject());
    }

    // 添加边界线用于可视化
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x00ff00, 0.5);
    graphics.strokeRect(0, 0, 800, 600);
  }

  spawnObject() {
    // 从对象池获取或创建对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机位置和速度
      const startX = Phaser.Math.Between(50, 750);
      const startY = Phaser.Math.Between(50, 150);
      const velocityX = Phaser.Math.Between(-150, 150);
      const velocityY = Phaser.Math.Between(100, 300);

      // 设置对象属性
      obj.setPosition(startX, startY);
      obj.setVelocity(velocityX, velocityY);
      obj.setActive(true);
      obj.setVisible(true);
      obj.body.enable = true;

      // 添加重力效果
      obj.body.setGravityY(200);
      
      // 添加弹跳效果
      obj.setBounce(0.7);
      obj.setCollideWorldBounds(false); // 不与边界碰撞，允许离开屏幕

      this.spawnedCount++;
      this.activeCount = this.objectPool.countActive(true);
    }
  }

  update(time, delta) {
    // 检查所有活跃对象
    const activeObjects = this.objectPool.getChildren();
    
    activeObjects.forEach(obj => {
      if (obj.active) {
        // 检查是否离开屏幕边界（留出一些余量）
        const margin = 50;
        if (obj.x < -margin || 
            obj.x > 800 + margin || 
            obj.y < -margin || 
            obj.y > 600 + margin) {
          
          // 回收对象
          this.recycleObject(obj);
        }
      }
    });

    // 更新状态显示
    this.updateStatus();
  }

  recycleObject(obj) {
    // 禁用对象并隐藏
    obj.setActive(false);
    obj.setVisible(false);
    obj.body.enable = false;
    obj.setVelocity(0, 0);
    
    this.recycledCount++;
    this.activeCount = this.objectPool.countActive(true);
  }

  updateStatus() {
    const poolSize = this.objectPool.getLength();
    const activeCount = this.objectPool.countActive(true);
    const inactiveCount = this.objectPool.countActive(false);
    
    this.statusText.setText([
      `Pool Size: ${poolSize}/8`,
      `Active Objects: ${activeCount}`,
      `Inactive Objects: ${inactiveCount}`,
      `Total Spawned: ${this.spawnedCount}`,
      `Total Recycled: ${this.recycledCount}`,
      `Reuse Rate: ${this.spawnedCount > 0 ? 
        ((this.recycledCount / this.spawnedCount) * 100).toFixed(1) : 0}%`
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
  scene: GameScene
};

new Phaser.Game(config);
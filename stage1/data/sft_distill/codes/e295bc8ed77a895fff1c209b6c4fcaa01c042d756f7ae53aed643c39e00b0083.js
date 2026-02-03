class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.totalSpawned = 0;     // 总发射次数
    this.recycledCount = 0;    // 回收次数
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
    // 创建物理对象池，最大15个对象
    this.objectPool = this.physics.add.group({
      defaultKey: 'yellowBall',
      maxSize: 15,
      runChildUpdate: false
    });

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时发射对象（每0.5秒一个）
    this.time.addEvent({
      delay: 500,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 添加说明文本
    this.add.text(10, 550, '黄色球从左侧发射，离开右侧屏幕后自动回收重用', {
      fontSize: '16px',
      fill: '#00ff00'
    });
  }

  spawnObject() {
    // 从对象池获取对象（如果池满则复用已有对象）
    const obj = this.objectPool.get(50, Phaser.Math.Between(100, 500));
    
    if (obj) {
      // 激活并设置物理属性
      obj.setActive(true);
      obj.setVisible(true);
      obj.body.enable = true;
      
      // 设置随机速度
      obj.setVelocity(
        Phaser.Math.Between(100, 300),
        Phaser.Math.Between(-50, 50)
      );

      this.totalSpawned++;
      this.updateStatus();
    }
  }

  update() {
    // 检查所有活跃对象
    const children = this.objectPool.getChildren();
    let activeObjects = 0;

    children.forEach(obj => {
      if (obj.active) {
        activeObjects++;
        
        // 检测是否离开屏幕右侧或上下边界
        if (obj.x > 850 || obj.y < -50 || obj.y > 650) {
          // 回收对象
          this.recycleObject(obj);
        }
      }
    });

    this.activeCount = activeObjects;
    this.updateStatus();
  }

  recycleObject(obj) {
    // 禁用物理和显示
    obj.setActive(false);
    obj.setVisible(false);
    obj.body.enable = false;
    obj.setVelocity(0, 0);
    
    this.recycledCount++;
  }

  updateStatus() {
    this.statusText.setText([
      `对象池状态 (最大15个)`,
      `活跃对象: ${this.activeCount}`,
      `总发射数: ${this.totalSpawned}`,
      `回收次数: ${this.recycledCount}`,
      `复用率: ${this.totalSpawned > 0 ? Math.floor((this.recycledCount / this.totalSpawned) * 100) : 0}%`
    ]);
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
  scene: PoolScene
};

new Phaser.Game(config);
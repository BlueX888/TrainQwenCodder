class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0; // 状态信号：当前活跃对象数量
    this.totalSpawned = 0; // 状态信号：总共生成次数
    this.totalRecycled = 0; // 状态信号：总共回收次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建灰色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('grayBox', 40, 40);
    graphics.destroy();

    // 创建物理组作为对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'grayBox',
      maxSize: 5, // 对象池最大容量为5
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时从对象池中获取对象并发射
    this.time.addEvent({
      delay: 1000, // 每秒发射一个
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 初始发射一些对象
    this.time.delayedCall(100, () => this.spawnObject());
    this.time.delayedCall(500, () => this.spawnObject());
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 设置随机起始位置（屏幕左侧）
      const startY = Phaser.Math.Between(50, 550);
      obj.setPosition(-50, startY);
      
      // 激活对象
      obj.setActive(true);
      obj.setVisible(true);
      
      // 设置随机速度向右移动
      const velocityX = Phaser.Math.Between(100, 300);
      const velocityY = Phaser.Math.Between(-50, 50);
      obj.setVelocity(velocityX, velocityY);
      
      // 添加旋转效果
      obj.setAngularVelocity(Phaser.Math.Between(-100, 100));
      
      this.totalSpawned++;
      this.updateActiveCount();
    }
  }

  update(time, delta) {
    // 检查所有活跃对象
    const activeObjects = this.objectPool.getChildren().filter(obj => obj.active);
    
    activeObjects.forEach(obj => {
      // 检测对象是否离开屏幕边界
      if (obj.x > 850 || obj.x < -50 || obj.y > 650 || obj.y < -50) {
        this.recycleObject(obj);
      }
    });

    // 更新状态显示
    this.updateStatusDisplay();
  }

  recycleObject(obj) {
    // 回收对象到池中
    obj.setVelocity(0, 0);
    obj.setAngularVelocity(0);
    obj.setActive(false);
    obj.setVisible(false);
    
    this.totalRecycled++;
    this.updateActiveCount();
    
    console.log(`对象已回收 - 总回收数: ${this.totalRecycled}`);
  }

  updateActiveCount() {
    // 更新活跃对象计数
    this.activeCount = this.objectPool.getChildren().filter(obj => obj.active).length;
  }

  updateStatusDisplay() {
    // 更新状态文本显示
    const poolSize = this.objectPool.getLength();
    const maxSize = this.objectPool.maxSize;
    
    this.statusText.setText([
      `对象池状态:`,
      `活跃对象: ${this.activeCount}/${maxSize}`,
      `池中总数: ${poolSize}`,
      `总生成: ${this.totalSpawned}`,
      `总回收: ${this.totalRecycled}`,
      `复用率: ${this.totalRecycled > 0 ? ((this.totalRecycled / this.totalSpawned) * 100).toFixed(1) : 0}%`
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
  scene: PoolScene
};

// 启动游戏
new Phaser.Game(config);
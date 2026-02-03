class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.totalSpawned = 0;     // 总发射次数
    this.recycledCount = 0;    // 回收次数
  }

  preload() {
    // 创建蓝色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('blueBox', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'blueBox',
      maxSize: 20,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.body.setCollideWorldBounds(false);
      }
    });

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时发射对象（每 500ms 发射一个）
    this.time.addEvent({
      delay: 500,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 更新状态显示
    this.updateStatus();
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 重置对象状态
      obj.setActive(true);
      obj.setVisible(true);
      
      // 随机位置（屏幕左侧）
      const startX = -20;
      const startY = Phaser.Math.Between(50, 550);
      obj.setPosition(startX, startY);
      
      // 设置随机速度（向右移动）
      const velocityX = Phaser.Math.Between(100, 300);
      const velocityY = Phaser.Math.Between(-100, 100);
      obj.setVelocity(velocityX, velocityY);
      
      // 添加旋转
      obj.setAngularVelocity(Phaser.Math.Between(-180, 180));
      
      this.totalSpawned++;
      this.activeCount++;
    }
  }

  update(time, delta) {
    // 检查所有活跃对象
    this.objectPool.getChildren().forEach((obj) => {
      if (obj.active) {
        // 检测是否离开屏幕边界
        if (obj.x > 850 || obj.x < -50 || obj.y > 650 || obj.y < -50) {
          // 回收对象
          this.recycleObject(obj);
        }
      }
    });

    // 更新状态显示
    this.updateStatus();
  }

  recycleObject(obj) {
    // 停止物理运动
    obj.setVelocity(0, 0);
    obj.setAngularVelocity(0);
    
    // 隐藏并标记为非活跃
    obj.setActive(false);
    obj.setVisible(false);
    
    this.activeCount--;
    this.recycledCount++;
  }

  updateStatus() {
    const poolSize = this.objectPool.getLength();
    const activeObjs = this.objectPool.countActive(true);
    
    this.statusText.setText([
      `Pool Size: ${poolSize}/20`,
      `Active Objects: ${activeObjs}`,
      `Total Spawned: ${this.totalSpawned}`,
      `Recycled: ${this.recycledCount}`,
      `Reuse Rate: ${this.totalSpawned > 0 ? 
        ((this.recycledCount / this.totalSpawned) * 100).toFixed(1) : 0}%`
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
  scene: GameScene
};

new Phaser.Game(config);
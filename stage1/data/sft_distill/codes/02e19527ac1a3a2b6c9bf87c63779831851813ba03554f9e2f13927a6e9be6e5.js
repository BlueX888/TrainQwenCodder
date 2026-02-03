class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;  // 当前活跃对象数
    this.recycleCount = 0;  // 回收次数
    this.spawnCount = 0;    // 生成次数
  }

  preload() {
    // 创建橙色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8C00, 1);  // 橙色
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('orangeCircle', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'orangeCircle',
      maxSize: 20,
      createCallback: (obj) => {
        // 对象创建时的回调
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 初始化 20 个对象
    for (let i = 0; i < 20; i++) {
      this.spawnObject();
    }

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时器：每 2 秒尝试重新激活一个对象
    this.time.addEvent({
      delay: 2000,
      callback: this.respawnObject,
      callbackScope: this,
      loop: true
    });

    // 更新状态显示
    this.updateStatus();
  }

  spawnObject() {
    // 从对象池获取或创建对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机位置（屏幕内）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      // 激活对象
      obj.setPosition(x, y);
      obj.setActive(true);
      obj.setVisible(true);
      
      // 设置随机速度
      const velocityX = Phaser.Math.Between(-200, 200);
      const velocityY = Phaser.Math.Between(-200, 200);
      obj.setVelocity(velocityX, velocityY);
      
      // 设置边界反弹
      obj.setBounce(1, 1);
      obj.setCollideWorldBounds(false);  // 不反弹，离开屏幕后回收
      
      this.spawnCount++;
      this.updateActiveCount();
    }
  }

  respawnObject() {
    // 尝试从对象池中获取一个未激活的对象并重新激活
    const inactiveObjects = this.objectPool.getChildren().filter(obj => !obj.active);
    
    if (inactiveObjects.length > 0) {
      const obj = inactiveObjects[0];
      
      // 随机新位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      obj.setPosition(x, y);
      obj.setActive(true);
      obj.setVisible(true);
      
      // 新的随机速度
      const velocityX = Phaser.Math.Between(-200, 200);
      const velocityY = Phaser.Math.Between(-200, 200);
      obj.setVelocity(velocityX, velocityY);
      
      this.spawnCount++;
      this.updateActiveCount();
    }
  }

  recycleObject(obj) {
    // 回收对象到对象池
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    
    this.recycleCount++;
    this.updateActiveCount();
  }

  updateActiveCount() {
    // 更新活跃对象计数
    this.activeCount = this.objectPool.getChildren().filter(obj => obj.active).length;
  }

  updateStatus() {
    // 更新状态文本
    const poolSize = this.objectPool.getLength();
    const text = [
      `Pool Size: ${poolSize}/20`,
      `Active Objects: ${this.activeCount}`,
      `Recycled: ${this.recycleCount}`,
      `Total Spawned: ${this.spawnCount}`
    ].join('\n');
    
    this.statusText.setText(text);
  }

  update(time, delta) {
    // 检查所有活跃对象是否离开屏幕
    this.objectPool.getChildren().forEach(obj => {
      if (obj.active) {
        // 检查是否完全离开屏幕（包含对象大小）
        const margin = 50;
        if (obj.x < -margin || obj.x > 800 + margin || 
            obj.y < -margin || obj.y > 600 + margin) {
          this.recycleObject(obj);
        }
      }
    });

    // 更新状态显示
    this.updateStatus();
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
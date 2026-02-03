class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.recycledCount = 0;    // 总回收次数
    this.spawnedCount = 0;     // 总生成次数
  }

  preload() {
    // 使用 Graphics 生成绿色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('greenBlock', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'greenBlock',
      maxSize: 20,
      createCallback: (obj) => {
        // 对象创建时的初始化
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 显示状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 每500毫秒生成一个对象
    this.time.addEvent({
      delay: 500,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 添加点击提示
    this.add.text(400, 300, 'Objects will spawn and recycle automatically', {
      fontSize: '20px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(400, 330, 'Green blocks move right and recycle when off-screen', {
      fontSize: '16px',
      fill: '#aaaaaa',
      align: 'center'
    }).setOrigin(0.5);
  }

  spawnObject() {
    // 从对象池获取或创建对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 重置对象状态
      obj.setActive(true);
      obj.setVisible(true);
      
      // 随机 Y 位置，从左侧开始
      const randomY = Phaser.Math.Between(50, 550);
      obj.setPosition(-32, randomY);
      
      // 设置随机速度（向右移动）
      const randomSpeed = Phaser.Math.Between(100, 300);
      obj.setVelocity(randomSpeed, 0);
      
      // 添加旋转效果
      obj.setAngularVelocity(Phaser.Math.Between(-180, 180));
      
      this.spawnedCount++;
      this.activeCount = this.objectPool.countActive(true);
    }
  }

  recycleObject(obj) {
    // 回收对象到池中
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    obj.setAngularVelocity(0);
    obj.setPosition(-100, -100); // 移到屏幕外
    
    this.recycledCount++;
    this.activeCount = this.objectPool.countActive(true);
  }

  update(time, delta) {
    // 检查所有活跃对象
    const activeObjects = this.objectPool.getChildren().filter(obj => obj.active);
    
    activeObjects.forEach(obj => {
      // 检测对象是否离开屏幕右侧
      if (obj.x > 832) { // 800 + 32 (对象宽度)
        this.recycleObject(obj);
      }
    });

    // 更新状态显示
    const poolSize = this.objectPool.getLength();
    const activeCount = this.objectPool.countActive(true);
    const inactiveCount = this.objectPool.countActive(false);
    
    this.statusText.setText([
      `Pool Size: ${poolSize} / 20`,
      `Active Objects: ${activeCount}`,
      `Inactive Objects: ${inactiveCount}`,
      `Total Spawned: ${this.spawnedCount}`,
      `Total Recycled: ${this.recycledCount}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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
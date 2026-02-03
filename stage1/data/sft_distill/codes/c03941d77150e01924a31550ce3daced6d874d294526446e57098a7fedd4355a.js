class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;      // 当前活跃对象数量（状态信号）
    this.recycleCount = 0;     // 总回收次数（状态信号）
    this.spawnCount = 0;       // 总发射次数（状态信号）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建绿色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('greenBox', 40, 40);
    graphics.destroy();

    // 创建对象池（Physics Group）
    this.objectPool = this.physics.add.group({
      defaultKey: 'greenBox',
      maxSize: 3,  // 最大3个对象
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 创建显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 550, 'Click to spawn objects (max 3 active)', {
      fontSize: '14px',
      color: '#ffff00'
    });

    // 点击发射对象
    this.input.on('pointerdown', (pointer) => {
      this.spawnObject(pointer.x, pointer.y);
    });

    // 自动发射演示
    this.time.addEvent({
      delay: 1500,
      callback: () => {
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(100, 200);
        this.spawnObject(x, y);
      },
      loop: true
    });

    this.updateStatusText();
  }

  spawnObject(x, y) {
    // 从对象池获取对象
    const obj = this.objectPool.get(x, y);
    
    if (obj) {
      // 激活对象
      obj.setActive(true);
      obj.setVisible(true);
      
      // 设置随机速度
      const velocityX = Phaser.Math.Between(-200, 200);
      const velocityY = Phaser.Math.Between(100, 300);
      obj.setVelocity(velocityX, velocityY);
      
      // 添加旋转效果
      obj.setAngularVelocity(Phaser.Math.Between(-180, 180));
      
      this.spawnCount++;
      this.activeCount = this.objectPool.countActive(true);
      this.updateStatusText();
      
      console.log(`Spawned object at (${x}, ${y}), Active: ${this.activeCount}`);
    } else {
      console.log('Object pool full, cannot spawn more');
    }
  }

  recycleObject(obj) {
    // 回收对象到池中
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    obj.setAngularVelocity(0);
    obj.setPosition(-100, -100);  // 移到屏幕外
    
    this.recycleCount++;
    this.activeCount = this.objectPool.countActive(true);
    this.updateStatusText();
    
    console.log(`Recycled object, Total recycled: ${this.recycleCount}`);
  }

  updateStatusText() {
    this.statusText.setText([
      `Active Objects: ${this.activeCount}/3`,
      `Total Spawned: ${this.spawnCount}`,
      `Total Recycled: ${this.recycleCount}`,
      `Pool Size: ${this.objectPool.getLength()}`
    ]);
  }

  update(time, delta) {
    // 检查所有活跃对象是否离开屏幕
    const activeObjects = this.objectPool.getChildren().filter(obj => obj.active);
    
    activeObjects.forEach(obj => {
      // 检查是否离开屏幕边界（包含一定余量）
      if (obj.x < -50 || obj.x > 850 || obj.y < -50 || obj.y > 650) {
        this.recycleObject(obj);
      }
    });
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
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: PoolScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露状态变量用于验证
game.events.on('ready', () => {
  console.log('Game ready - Object pool demo started');
  console.log('Click anywhere to spawn objects (max 3 active)');
});
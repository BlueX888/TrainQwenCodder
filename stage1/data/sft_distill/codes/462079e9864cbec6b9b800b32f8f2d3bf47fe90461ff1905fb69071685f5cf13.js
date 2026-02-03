class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.totalSpawned = 0;     // 总发射次数
    this.recycledCount = 0;    // 回收次数
  }

  preload() {
    // 使用 Graphics 创建绿色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('greenBox', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建对象池（Physics Group）
    this.objectPool = this.physics.add.group({
      defaultKey: 'greenBox',
      maxSize: 3,  // 对象池最大容量为3
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 80, 'Click to spawn objects\n(Max 3 in pool)', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    // 点击屏幕发射对象
    this.input.on('pointerdown', (pointer) => {
      this.spawnObject(pointer.x, pointer.y);
    });

    // 自动发射演示（每1.5秒）
    this.time.addEvent({
      delay: 1500,
      callback: () => {
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(100, 500);
        this.spawnObject(x, y);
      },
      loop: true
    });

    this.updateStatus();
  }

  spawnObject(x, y) {
    // 从对象池获取对象
    const obj = this.objectPool.get(x, y);
    
    if (obj) {
      // 激活并显示对象
      obj.setActive(true);
      obj.setVisible(true);
      
      // 设置随机速度
      const velocityX = Phaser.Math.Between(-200, 200);
      const velocityY = Phaser.Math.Between(-200, 200);
      obj.setVelocity(velocityX, velocityY);
      
      // 添加旋转效果
      obj.setAngularVelocity(Phaser.Math.Between(-180, 180));
      
      this.totalSpawned++;
      this.updateActiveCount();
      
      console.log(`Spawned object at (${x}, ${y}), Active: ${this.activeCount}`);
    } else {
      console.log('Object pool is full or unavailable');
    }
  }

  update(time, delta) {
    // 遍历对象池中的所有活跃对象
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检测对象是否离开屏幕边界（增加缓冲区）
        const bounds = 100;
        if (obj.x < -bounds || obj.x > this.cameras.main.width + bounds ||
            obj.y < -bounds || obj.y > this.cameras.main.height + bounds) {
          
          // 回收对象到对象池
          this.recycleObject(obj);
        }
      }
    });

    this.updateStatus();
  }

  recycleObject(obj) {
    console.log(`Recycling object at (${Math.round(obj.x)}, ${Math.round(obj.y)})`);
    
    // 停止物理运动
    obj.setVelocity(0, 0);
    obj.setAngularVelocity(0);
    
    // 隐藏并停用对象
    obj.setActive(false);
    obj.setVisible(false);
    
    this.recycledCount++;
    this.updateActiveCount();
  }

  updateActiveCount() {
    // 计算当前活跃对象数量
    this.activeCount = this.objectPool.countActive(true);
  }

  updateStatus() {
    this.statusText.setText([
      `Active Objects: ${this.activeCount}/3`,
      `Total Spawned: ${this.totalSpawned}`,
      `Recycled: ${this.recycledCount}`,
      `Pool Size: ${this.objectPool.getLength()}`
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

// 创建游戏实例
const game = new Phaser.Game(config);
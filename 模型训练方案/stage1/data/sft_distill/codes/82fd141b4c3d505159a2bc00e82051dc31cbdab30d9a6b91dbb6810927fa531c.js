class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.recycledCount = 0;    // 总回收次数
    this.spawnedCount = 0;     // 总发射次数
  }

  preload() {
    // 创建紫色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9b59b6, 1); // 紫色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('purpleBlock', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建对象池（Physics Group）
    this.objectPool = this.physics.add.group({
      defaultKey: 'purpleBlock',
      maxSize: 5,
      runChildUpdate: false,
      createCallback: (obj) => {
        obj.setActive(false);
        obj.setVisible(false);
      }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(10, 70, 'Click to spawn objects\nObjects recycle when off-screen', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 点击发射对象
    this.input.on('pointerdown', (pointer) => {
      this.spawnObject(pointer.x, pointer.y);
    });

    // 每秒自动发射一个对象（用于演示）
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(100, 300);
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
      // 激活对象
      obj.setActive(true);
      obj.setVisible(true);
      
      // 设置随机速度
      const velocityX = Phaser.Math.Between(-200, 200);
      const velocityY = Phaser.Math.Between(100, 300);
      obj.setVelocity(velocityX, velocityY);
      
      // 添加旋转效果
      obj.setAngularVelocity(Phaser.Math.Between(-180, 180));
      
      this.spawnedCount++;
      this.activeCount++;
      this.updateStatus();
    }
  }

  recycleObject(obj) {
    // 回收对象到池中
    obj.setActive(false);
    obj.setVisible(false);
    obj.setVelocity(0, 0);
    obj.setAngularVelocity(0);
    
    this.recycledCount++;
    this.activeCount--;
    this.updateStatus();
  }

  update() {
    // 检查所有活跃对象是否离屏
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        // 检测是否离开屏幕边界（包含一定缓冲区）
        if (obj.x < -50 || obj.x > this.scale.width + 50 ||
            obj.y < -50 || obj.y > this.scale.height + 50) {
          this.recycleObject(obj);
        }
      }
    });
  }

  updateStatus() {
    this.statusText.setText([
      `Active Objects: ${this.activeCount}/5`,
      `Spawned: ${this.spawnedCount}`,
      `Recycled: ${this.recycledCount}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
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
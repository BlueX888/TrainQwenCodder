class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;
    this.totalSpawned = 0;
    this.recycledCount = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 1. 使用 Graphics 生成绿色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('greenBox', 32, 32);
    graphics.destroy();

    // 2. 创建物理对象池 (最多10个对象)
    this.objectPool = this.physics.add.group({
      defaultKey: 'greenBox',
      maxSize: 10,
      runChildUpdate: false,
      createCallback: (obj) => {
        // 配置每个对象的物理属性
        obj.setActive(false);
        obj.setVisible(false);
        obj.body.setAllowGravity(false);
      }
    });

    // 3. 配置边界检测和自动回收
    this.physics.world.on('worldbounds', (body) => {
      // 当对象离开屏幕边界时回收
      if (body.gameObject && body.gameObject.active) {
        this.recycleObject(body.gameObject);
      }
    });

    // 4. 定时发射对象（每0.8秒）
    this.time.addEvent({
      delay: 800,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 5. 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 6. 添加手动发射按钮提示
    this.add.text(10, 550, 'Click to spawn object', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    this.input.on('pointerdown', () => {
      this.spawnObject();
    });
  }

  spawnObject() {
    // 从对象池获取或创建对象
    let obj = this.objectPool.get();

    if (obj) {
      // 重置对象属性
      const x = Phaser.Math.Between(50, 750);
      const y = 50;
      
      obj.setPosition(x, y);
      obj.setActive(true);
      obj.setVisible(true);
      
      // 启用物理体和边界检测
      obj.body.enable = true;
      obj.body.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(100, 200)
      );
      obj.body.setBounce(0.8);
      obj.body.setCollideWorldBounds(true);
      obj.body.onWorldBounds = true;

      this.totalSpawned++;
      this.activeCount = this.objectPool.countActive(true);
    }
  }

  recycleObject(obj) {
    // 回收对象到池中
    obj.setActive(false);
    obj.setVisible(false);
    obj.body.setVelocity(0, 0);
    obj.body.enable = false;
    
    this.recycledCount++;
    this.activeCount = this.objectPool.countActive(true);
  }

  update(time, delta) {
    // 更新状态信息
    this.activeCount = this.objectPool.countActive(true);
    const poolSize = this.objectPool.getLength();
    
    this.statusText.setText([
      `Active Objects: ${this.activeCount}`,
      `Pool Size: ${poolSize} / 10`,
      `Total Spawned: ${this.totalSpawned}`,
      `Recycled: ${this.recycledCount}`
    ]);

    // 检查离屏对象并回收
    this.objectPool.children.entries.forEach((obj) => {
      if (obj.active) {
        const bounds = this.physics.world.bounds;
        if (obj.y > bounds.height + 50 || 
            obj.x < -50 || 
            obj.x > bounds.width + 50) {
          this.recycleObject(obj);
        }
      }
    });
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
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);
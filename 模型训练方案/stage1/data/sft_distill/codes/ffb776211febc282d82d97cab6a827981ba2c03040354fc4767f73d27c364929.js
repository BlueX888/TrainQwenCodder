class PoolScene extends Phaser.Scene {
  constructor() {
    super('PoolScene');
    this.activeCount = 0;  // 当前活跃对象数量
    this.recycledCount = 0;  // 总回收次数
    this.spawnedCount = 0;  // 总发射次数
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建红色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('redBox', 32, 32);
    graphics.destroy();

    // 创建物理对象池
    this.objectPool = this.physics.add.group({
      defaultKey: 'redBox',
      maxSize: 20,  // 对象池最大容量
      runChildUpdate: false,
      createCallback: (sprite) => {
        // 对象创建时的初始化
        sprite.setActive(false);
        sprite.setVisible(false);
        sprite.body.enable = false;
      }
    });

    // 预创建 20 个对象
    for (let i = 0; i < 20; i++) {
      const obj = this.objectPool.create(0, 0, 'redBox');
      obj.setActive(false);
      obj.setVisible(false);
      obj.body.enable = false;
    }

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 定时发射对象
    this.time.addEvent({
      delay: 500,  // 每 500ms 发射一个对象
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 添加点击发射功能
    this.input.on('pointerdown', (pointer) => {
      this.spawnObjectAt(pointer.x, pointer.y);
    });

    this.updateStatusText();
  }

  spawnObject() {
    // 从屏幕顶部随机位置发射
    const x = Phaser.Math.Between(50, 750);
    this.spawnObjectAt(x, 0);
  }

  spawnObjectAt(x, y) {
    // 从对象池获取一个未使用的对象
    const obj = this.objectPool.get(x, y, 'redBox');

    if (obj) {
      // 激活对象
      obj.setActive(true);
      obj.setVisible(true);
      obj.body.enable = true;

      // 设置随机速度
      const velocityX = Phaser.Math.Between(-200, 200);
      const velocityY = Phaser.Math.Between(100, 300);
      obj.setVelocity(velocityX, velocityY);

      // 设置重力
      obj.body.setGravityY(200);

      // 添加旋转效果
      obj.setAngularVelocity(Phaser.Math.Between(-180, 180));

      this.activeCount++;
      this.spawnedCount++;
      this.updateStatusText();
    }
  }

  update(time, delta) {
    // 检查所有活跃对象
    const children = this.objectPool.getChildren();
    
    children.forEach((obj) => {
      if (obj.active) {
        // 检查是否离开屏幕边界
        if (obj.x < -50 || obj.x > 850 || obj.y > 650) {
          this.recycleObject(obj);
        }
      }
    });

    this.updateStatusText();
  }

  recycleObject(obj) {
    // 回收对象到对象池
    obj.setActive(false);
    obj.setVisible(false);
    obj.body.enable = false;
    obj.setVelocity(0, 0);
    obj.setAngularVelocity(0);
    obj.setPosition(0, 0);
    obj.setRotation(0);

    this.activeCount--;
    this.recycledCount++;
  }

  updateStatusText() {
    const poolSize = this.objectPool.getLength();
    const availableCount = poolSize - this.activeCount;
    
    this.statusText.setText([
      `对象池容量: ${poolSize}`,
      `活跃对象: ${this.activeCount}`,
      `可用对象: ${availableCount}`,
      `已发射: ${this.spawnedCount}`,
      `已回收: ${this.recycledCount}`,
      '',
      '点击屏幕发射对象'
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
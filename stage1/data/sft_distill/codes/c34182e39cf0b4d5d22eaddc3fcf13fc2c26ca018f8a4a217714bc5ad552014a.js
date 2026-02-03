class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;      // 当前活跃对象数
    this.totalSpawned = 0;     // 总生成次数
    this.recycledCount = 0;    // 回收次数
  }

  preload() {
    // 创建绿色方块纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('greenBlock', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池，最大容量 20
    this.objectPool = this.physics.add.group({
      defaultKey: 'greenBlock',
      maxSize: 20,
      runChildUpdate: false,
      createCallback: (obj) => {
        // 设置对象离开世界边界时触发事件
        obj.body.setCollideWorldBounds(false);
        obj.body.onWorldBounds = true;
      }
    });

    // 监听世界边界事件，自动回收离屏对象
    this.physics.world.on('worldbounds', (body) => {
      const sprite = body.gameObject;
      if (this.objectPool.contains(sprite)) {
        this.recycleObject(sprite);
      }
    });

    // 启用世界边界
    this.physics.world.setBounds(0, 0, 800, 600);

    // 定时生成对象（每 500ms）
    this.time.addEvent({
      delay: 500,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示说明
    this.add.text(10, 560, '对象池演示：绿色方块离屏后自动回收重用', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    this.updateStatus();
  }

  spawnObject() {
    // 从对象池获取对象（如果池满则复用）
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机位置和速度
      const startX = Phaser.Math.Between(50, 750);
      const startY = -32; // 从顶部生成
      const velocityX = Phaser.Math.Between(-100, 100);
      const velocityY = Phaser.Math.Between(100, 200);

      // 激活对象
      obj.setActive(true);
      obj.setVisible(true);
      obj.setPosition(startX, startY);
      obj.body.setVelocity(velocityX, velocityY);
      obj.body.setAngularVelocity(Phaser.Math.Between(-180, 180));

      this.totalSpawned++;
      this.activeCount = this.objectPool.countActive(true);
      this.updateStatus();
    }
  }

  recycleObject(obj) {
    // 回收对象到池中
    obj.setActive(false);
    obj.setVisible(false);
    obj.body.setVelocity(0, 0);
    obj.body.setAngularVelocity(0);
    
    this.recycledCount++;
    this.activeCount = this.objectPool.countActive(true);
    this.updateStatus();
  }

  updateStatus() {
    const poolSize = this.objectPool.getLength();
    const activeObjs = this.objectPool.countActive(true);
    const inactiveObjs = this.objectPool.countActive(false);
    
    this.statusText.setText([
      `对象池状态:`,
      `总容量: ${poolSize} / 20`,
      `活跃对象: ${activeObjs}`,
      `空闲对象: ${inactiveObjs}`,
      `总生成次数: ${this.totalSpawned}`,
      `回收次数: ${this.recycledCount}`,
      `复用率: ${this.totalSpawned > 0 ? Math.floor((this.recycledCount / this.totalSpawned) * 100) : 0}%`
    ]);
  }

  update(time, delta) {
    // 可选：手动检查离屏对象（worldbounds 事件已处理）
    this.objectPool.children.iterate((obj) => {
      if (obj.active) {
        // 检查是否完全离开屏幕
        if (obj.y > 650 || obj.x < -50 || obj.x > 850) {
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);
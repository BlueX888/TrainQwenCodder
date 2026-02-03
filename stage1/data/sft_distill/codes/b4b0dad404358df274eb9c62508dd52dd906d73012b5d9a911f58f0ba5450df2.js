class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.activeCount = 0;
    this.recycleCount = 0;
    this.spawnCount = 0;
  }

  preload() {
    // 创建白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('whiteBlock', 32, 32);
    graphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      activeCount: 0,
      recycleCount: 0,
      spawnCount: 0,
      poolSize: 8,
      logs: []
    };

    // 创建对象池，最大 8 个对象
    this.objectPool = this.physics.add.group({
      defaultKey: 'whiteBlock',
      maxSize: 8,
      runChildUpdate: false
    });

    // 监听物理世界边界事件
    this.physics.world.on('worldbounds', (body) => {
      const sprite = body.gameObject;
      
      // 对象离开屏幕，回收到池中
      if (sprite && sprite.active) {
        this.recycleObject(sprite);
      }
    });

    // 每 800ms 生成一个新对象
    this.time.addEvent({
      delay: 800,
      callback: this.spawnObject,
      callbackScope: this,
      loop: true
    });

    // 初始生成几个对象
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 300, () => {
        this.spawnObject();
      });
    }

    // 显示状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  spawnObject() {
    // 从对象池获取对象
    const obj = this.objectPool.get();
    
    if (obj) {
      // 随机位置（屏幕上方或左侧）
      const side = Phaser.Math.Between(0, 1);
      if (side === 0) {
        // 从上方生成
        obj.setPosition(Phaser.Math.Between(50, 750), -20);
        obj.setVelocity(
          Phaser.Math.Between(-100, 100),
          Phaser.Math.Between(100, 200)
        );
      } else {
        // 从左侧生成
        obj.setPosition(-20, Phaser.Math.Between(50, 550));
        obj.setVelocity(
          Phaser.Math.Between(100, 200),
          Phaser.Math.Between(-50, 50)
        );
      }

      // 启用物理边界检测
      obj.body.setCollideWorldBounds(false);
      obj.body.onWorldBounds = true;

      // 激活对象
      obj.setActive(true);
      obj.setVisible(true);

      this.spawnCount++;
      this.activeCount = this.objectPool.countActive(true);

      // 记录生成日志
      const log = {
        action: 'spawn',
        time: this.time.now,
        spawnCount: this.spawnCount,
        activeCount: this.activeCount,
        position: { x: Math.round(obj.x), y: Math.round(obj.y) }
      };
      
      window.__signals__.logs.push(log);
      console.log(JSON.stringify(log));

      this.updateSignals();
    } else {
      // 对象池已满
      const log = {
        action: 'pool_full',
        time: this.time.now,
        activeCount: this.activeCount
      };
      window.__signals__.logs.push(log);
      console.log(JSON.stringify(log));
    }
  }

  recycleObject(obj) {
    // 回收对象
    this.objectPool.killAndHide(obj);
    obj.body.stop();

    this.recycleCount++;
    this.activeCount = this.objectPool.countActive(true);

    // 记录回收日志
    const log = {
      action: 'recycle',
      time: this.time.now,
      recycleCount: this.recycleCount,
      activeCount: this.activeCount
    };

    window.__signals__.logs.push(log);
    console.log(JSON.stringify(log));

    this.updateSignals();
  }

  updateSignals() {
    window.__signals__.activeCount = this.activeCount;
    window.__signals__.recycleCount = this.recycleCount;
    window.__signals__.spawnCount = this.spawnCount;
    
    this.updateStatusText();
  }

  updateStatusText() {
    const poolInfo = `Pool: ${this.activeCount}/${window.__signals__.poolSize}`;
    const spawnInfo = `Spawned: ${this.spawnCount}`;
    const recycleInfo = `Recycled: ${this.recycleCount}`;
    
    this.statusText.setText([
      'Object Pool Manager',
      poolInfo,
      spawnInfo,
      recycleInfo,
      '',
      'White objects auto-recycle',
      'when leaving screen'
    ]);
  }

  update(time, delta) {
    // 检查对象是否离开屏幕（备用检测）
    this.objectPool.children.entries.forEach(obj => {
      if (obj.active) {
        if (obj.x < -50 || obj.x > 850 || obj.y < -50 || obj.y > 650) {
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
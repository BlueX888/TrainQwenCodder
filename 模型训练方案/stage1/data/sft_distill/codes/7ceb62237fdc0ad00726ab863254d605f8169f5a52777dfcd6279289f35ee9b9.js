class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.speed = 360;
    this.signals = {
      objectCount: 0,
      positions: [],
      isMoving: false,
      direction: { x: 0, y: 0 },
      frameCount: 0
    };
  }

  preload() {
    // 使用Graphics创建蓝色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('blueBox', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建10个蓝色对象，随机分布
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      const obj = this.add.image(x, y, 'blueBox');
      this.objects.push(obj);
    }

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加WASD键作为备选
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 初始化signals
    this.signals.objectCount = this.objects.length;
    this.updateSignals();

    // 显示提示文本
    this.add.text(10, 10, 'Use Arrow Keys or WASD to move all objects', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 40, '', {
      fontSize: '14px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 暴露signals到全局
    window.__signals__ = this.signals;

    console.log('[INIT] Game started with 10 blue objects');
  }

  update(time, delta) {
    // 计算移动方向
    let velocityX = 0;
    let velocityY = 0;

    // 检测方向键输入
    if (this.cursors.left.isDown || this.keyA.isDown) {
      velocityX = -1;
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      velocityX = 1;
    }

    if (this.cursors.up.isDown || this.keyW.isDown) {
      velocityY = -1;
    } else if (this.cursors.down.isDown || this.keyS.isDown) {
      velocityY = 1;
    }

    // 标准化对角线移动速度
    const isMoving = velocityX !== 0 || velocityY !== 0;
    
    if (isMoving) {
      const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      velocityX /= length;
      velocityY /= length;

      // 计算实际移动距离（速度 * 时间）
      const moveX = velocityX * this.speed * (delta / 1000);
      const moveY = velocityY * this.speed * (delta / 1000);

      // 同步移动所有对象
      this.objects.forEach(obj => {
        obj.x += moveX;
        obj.y += moveY;

        // 边界限制（可选，防止对象移出屏幕）
        obj.x = Phaser.Math.Clamp(obj.x, 16, this.cameras.main.width - 16);
        obj.y = Phaser.Math.Clamp(obj.y, 16, this.cameras.main.height - 16);
      });
    }

    // 更新signals
    this.signals.isMoving = isMoving;
    this.signals.direction.x = velocityX;
    this.signals.direction.y = velocityY;
    this.signals.frameCount++;

    // 每30帧更新一次位置记录和日志
    if (this.signals.frameCount % 30 === 0) {
      this.updateSignals();
      
      if (isMoving) {
        console.log(JSON.stringify({
          frame: this.signals.frameCount,
          moving: true,
          direction: this.signals.direction,
          samplePosition: this.signals.positions[0]
        }));
      }
    }

    // 更新状态文本
    this.statusText.setText(
      `Objects: ${this.signals.objectCount} | ` +
      `Moving: ${isMoving ? 'YES' : 'NO'} | ` +
      `Direction: (${velocityX.toFixed(1)}, ${velocityY.toFixed(1)}) | ` +
      `Frame: ${this.signals.frameCount}`
    );
  }

  updateSignals() {
    this.signals.positions = this.objects.map(obj => ({
      x: Math.round(obj.x),
      y: Math.round(obj.y)
    }));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 初始化全局signals
window.__signals__ = {
  objectCount: 0,
  positions: [],
  isMoving: false,
  direction: { x: 0, y: 0 },
  frameCount: 0
};
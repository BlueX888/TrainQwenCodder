class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.cursors = null;
    this.moveSpeed = 300;
  }

  preload() {
    // 创建黄色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFFF00, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('yellowBox', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建15个黄色对象，以3x5网格排列
    const cols = 5;
    const rows = 3;
    const spacing = 120;
    const startX = 200;
    const startY = 150;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * spacing;
        const y = startY + row * spacing;
        const obj = this.add.image(x, y, 'yellowBox');
        this.objects.push(obj);
      }
    }

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 初始化signals
    window.__signals__ = {
      objectCount: 15,
      positions: [],
      velocity: { x: 0, y: 0 },
      totalMoveDistance: 0,
      frameCount: 0
    };

    // 添加文本显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateSignals();
  }

  update(time, delta) {
    // 计算移动速度（像素/秒转换为像素/帧）
    const deltaSeconds = delta / 1000;
    const moveDistance = this.moveSpeed * deltaSeconds;

    let velocityX = 0;
    let velocityY = 0;

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      velocityX = -1;
    } else if (this.cursors.right.isDown) {
      velocityX = 1;
    }

    if (this.cursors.up.isDown) {
      velocityY = -1;
    } else if (this.cursors.down.isDown) {
      velocityY = 1;
    }

    // 归一化对角线移动速度
    if (velocityX !== 0 && velocityY !== 0) {
      const normalizer = Math.sqrt(2);
      velocityX /= normalizer;
      velocityY /= normalizer;
    }

    // 同步移动所有对象
    const actualMoveX = velocityX * moveDistance;
    const actualMoveY = velocityY * moveDistance;

    this.objects.forEach(obj => {
      obj.x += actualMoveX;
      obj.y += actualMoveY;

      // 边界限制
      obj.x = Phaser.Math.Clamp(obj.x, 20, 780);
      obj.y = Phaser.Math.Clamp(obj.y, 20, 580);
    });

    // 更新移动距离
    if (actualMoveX !== 0 || actualMoveY !== 0) {
      const distance = Math.sqrt(actualMoveX * actualMoveX + actualMoveY * actualMoveY);
      window.__signals__.totalMoveDistance += distance;
    }

    // 更新signals
    window.__signals__.velocity = { x: velocityX, y: velocityY };
    window.__signals__.frameCount++;

    // 每30帧更新一次位置信息
    if (window.__signals__.frameCount % 30 === 0) {
      this.updateSignals();
    }

    // 更新显示文本
    this.infoText.setText([
      `Objects: ${this.objects.length}`,
      `Speed: ${this.moveSpeed}`,
      `Velocity: (${velocityX.toFixed(1)}, ${velocityY.toFixed(1)})`,
      `Total Distance: ${window.__signals__.totalMoveDistance.toFixed(2)}`,
      `Use Arrow Keys to Move All Objects`
    ]);
  }

  updateSignals() {
    window.__signals__.positions = this.objects.map((obj, index) => ({
      id: index,
      x: Math.round(obj.x),
      y: Math.round(obj.y)
    }));

    // 输出日志JSON
    console.log(JSON.stringify({
      timestamp: Date.now(),
      objectCount: window.__signals__.objectCount,
      velocity: window.__signals__.velocity,
      totalMoveDistance: Math.round(window.__signals__.totalMoveDistance),
      samplePositions: window.__signals__.positions.slice(0, 3) // 只显示前3个对象位置
    }));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

new Phaser.Game(config);
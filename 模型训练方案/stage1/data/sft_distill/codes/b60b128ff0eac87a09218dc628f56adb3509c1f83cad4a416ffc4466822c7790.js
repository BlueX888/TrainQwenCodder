class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.moveSpeed = 160;
    this.signals = {
      objectCount: 20,
      totalMoveDistance: 0,
      currentPositions: [],
      lastMoveDirection: 'none',
      frameCount: 0
    };
  }

  preload() {
    // 创建灰色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('grayBox', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建 20 个灰色对象，排列成 4x5 网格
    const cols = 5;
    const rows = 4;
    const startX = 150;
    const startY = 100;
    const spacingX = 100;
    const spacingY = 100;

    for (let i = 0; i < 20; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;
      
      const obj = this.add.sprite(x, y, 'grayBox');
      obj.setOrigin(0.5, 0.5);
      obj.initialX = x;
      obj.initialY = y;
      this.objects.push(obj);
    }

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加显示文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 暴露 signals 到全局
    window.__signals__ = this.signals;

    // 初始化位置信息
    this.updateSignals('none', 0);

    console.log('[GAME_INIT]', JSON.stringify({
      objectCount: this.objects.length,
      moveSpeed: this.moveSpeed,
      initialPositions: this.objects.map((obj, i) => ({
        id: i,
        x: obj.x,
        y: obj.y
      }))
    }));
  }

  update(time, delta) {
    this.signals.frameCount++;

    let moveX = 0;
    let moveY = 0;
    let direction = 'none';

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      moveX = -1;
      direction = 'left';
    } else if (this.cursors.right.isDown) {
      moveX = 1;
      direction = 'right';
    }

    if (this.cursors.up.isDown) {
      moveY = -1;
      direction = direction === 'none' ? 'up' : direction + '+up';
    } else if (this.cursors.down.isDown) {
      moveY = 1;
      direction = direction === 'none' ? 'down' : direction + '+down';
    }

    // 同步移动所有对象
    if (moveX !== 0 || moveY !== 0) {
      const distance = this.moveSpeed * (delta / 1000);
      const deltaX = moveX * distance;
      const deltaY = moveY * distance;

      this.objects.forEach(obj => {
        obj.x += deltaX;
        obj.y += deltaY;
      });

      // 更新总移动距离
      const actualDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      this.signals.totalMoveDistance += actualDistance;
      
      this.updateSignals(direction, actualDistance);

      // 每 60 帧输出一次日志
      if (this.signals.frameCount % 60 === 0) {
        console.log('[MOVE_UPDATE]', JSON.stringify({
          frame: this.signals.frameCount,
          direction: direction,
          totalDistance: Math.round(this.signals.totalMoveDistance),
          samplePosition: {
            id: 0,
            x: Math.round(this.objects[0].x),
            y: Math.round(this.objects[0].y)
          }
        }));
      }
    } else {
      this.updateSignals('none', 0);
    }

    // 更新显示文本
    this.infoText.setText([
      `Objects: ${this.signals.objectCount}`,
      `Direction: ${this.signals.lastMoveDirection}`,
      `Total Distance: ${Math.round(this.signals.totalMoveDistance)}`,
      `Frame: ${this.signals.frameCount}`,
      `Sample Pos: (${Math.round(this.objects[0].x)}, ${Math.round(this.objects[0].y)})`
    ]);
  }

  updateSignals(direction, distance) {
    this.signals.lastMoveDirection = direction;
    this.signals.currentPositions = this.objects.map((obj, i) => ({
      id: i,
      x: Math.round(obj.x * 10) / 10,
      y: Math.round(obj.y * 10) / 10
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

// 暴露游戏实例用于测试
window.__game__ = game;
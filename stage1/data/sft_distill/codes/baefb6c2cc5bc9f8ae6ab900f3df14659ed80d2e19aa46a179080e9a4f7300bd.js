// 全局信号对象，用于验证游戏状态
window.__signals__ = {
  objectsCount: 5,
  speed: 300,
  objects: [],
  lastDirection: 'none',
  totalMoveDistance: 0,
  updateCount: 0
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.cursors = null;
    this.speed = 300;
  }

  preload() {
    // 使用 Graphics 创建紫色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932cc, 1); // 紫色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('purpleBox', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建 5 个紫色对象，分散在不同位置
    const positions = [
      { x: 200, y: 200 },
      { x: 400, y: 150 },
      { x: 600, y: 200 },
      { x: 300, y: 350 },
      { x: 500, y: 400 }
    ];

    positions.forEach((pos, index) => {
      const obj = this.add.sprite(pos.x, pos.y, 'purpleBox');
      obj.setOrigin(0.5);
      this.objects.push(obj);

      // 初始化信号数据
      window.__signals__.objects.push({
        id: index,
        x: pos.x,
        y: pos.y,
        initialX: pos.x,
        initialY: pos.y
      });
    });

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文字
    this.add.text(10, 10, 'Use Arrow Keys to move all 5 purple objects', {
      fontSize: '18px',
      color: '#ffffff'
    });

    // 添加状态显示文字
    this.statusText = this.add.text(10, 40, '', {
      fontSize: '16px',
      color: '#00ff00'
    });

    console.log('[GameInit] 5 purple objects created at positions:', positions);
  }

  update(time, delta) {
    let velocityX = 0;
    let velocityY = 0;
    let direction = 'none';

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      velocityX = -this.speed;
      direction = 'left';
    } else if (this.cursors.right.isDown) {
      velocityX = this.speed;
      direction = 'right';
    }

    if (this.cursors.up.isDown) {
      velocityY = -this.speed;
      direction = direction === 'none' ? 'up' : direction + '+up';
    } else if (this.cursors.down.isDown) {
      velocityY = this.speed;
      direction = direction === 'none' ? 'down' : direction + '+down';
    }

    // 同步移动所有对象
    if (velocityX !== 0 || velocityY !== 0) {
      const moveX = velocityX * (delta / 1000);
      const moveY = velocityY * (delta / 1000);
      const moveDistance = Math.sqrt(moveX * moveX + moveY * moveY);

      this.objects.forEach((obj, index) => {
        obj.x += moveX;
        obj.y += moveY;

        // 边界限制
        obj.x = Phaser.Math.Clamp(obj.x, 20, 780);
        obj.y = Phaser.Math.Clamp(obj.y, 20, 580);

        // 更新信号数据
        window.__signals__.objects[index].x = Math.round(obj.x);
        window.__signals__.objects[index].y = Math.round(obj.y);
      });

      window.__signals__.totalMoveDistance += moveDistance;
      window.__signals__.lastDirection = direction;
    } else {
      window.__signals__.lastDirection = 'none';
    }

    window.__signals__.updateCount++;

    // 更新状态显示
    this.statusText.setText(
      `Direction: ${direction} | Updates: ${window.__signals__.updateCount} | ` +
      `Distance: ${Math.round(window.__signals__.totalMoveDistance)}`
    );

    // 每 60 帧输出一次日志
    if (window.__signals__.updateCount % 60 === 0) {
      console.log(JSON.stringify({
        frame: window.__signals__.updateCount,
        direction: window.__signals__.lastDirection,
        totalDistance: Math.round(window.__signals__.totalMoveDistance),
        objectPositions: window.__signals__.objects.map(o => ({ x: o.x, y: o.y }))
      }));
    }
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
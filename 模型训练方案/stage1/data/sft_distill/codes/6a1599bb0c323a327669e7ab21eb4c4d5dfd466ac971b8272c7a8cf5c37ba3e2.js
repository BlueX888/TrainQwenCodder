class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.speed = 160;
  }

  preload() {
    // 使用Graphics创建灰色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('grayBox', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建20个灰色对象，排列成4x5网格
    const startX = 150;
    const startY = 100;
    const spacingX = 100;
    const spacingY = 100;

    for (let i = 0; i < 20; i++) {
      const row = Math.floor(i / 5);
      const col = i % 5;
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;
      
      const obj = this.add.sprite(x, y, 'grayBox');
      obj.setOrigin(0.5, 0.5);
      this.objects.push(obj);
    }

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 初始化信号对象
    window.__signals__ = {
      objectCount: 20,
      speed: this.speed,
      positions: [],
      isMoving: false,
      direction: 'none',
      frameCount: 0
    };

    // 添加文本提示
    this.add.text(10, 10, 'Use Arrow Keys to Move All Objects', {
      fontSize: '16px',
      color: '#ffffff'
    });

    console.log(JSON.stringify({
      event: 'game_start',
      objectCount: 20,
      speed: this.speed
    }));
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;
    let velocityX = 0;
    let velocityY = 0;
    let direction = 'none';
    let isMoving = false;

    // 检测方向键状态
    if (this.cursors.left.isDown) {
      velocityX = -this.speed;
      direction = 'left';
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = this.speed;
      direction = 'right';
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      velocityY = -this.speed;
      direction = direction === 'none' ? 'up' : direction + '_up';
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = this.speed;
      direction = direction === 'none' ? 'down' : direction + '_down';
      isMoving = true;
    }

    // 同步移动所有对象
    if (isMoving) {
      this.objects.forEach(obj => {
        obj.x += velocityX * deltaSeconds;
        obj.y += velocityY * deltaSeconds;

        // 边界检测，防止对象移出屏幕
        obj.x = Phaser.Math.Clamp(obj.x, 16, 784);
        obj.y = Phaser.Math.Clamp(obj.y, 16, 584);
      });
    }

    // 更新signals
    window.__signals__.isMoving = isMoving;
    window.__signals__.direction = direction;
    window.__signals__.frameCount++;
    window.__signals__.positions = this.objects.map((obj, index) => ({
      id: index,
      x: Math.round(obj.x),
      y: Math.round(obj.y)
    }));

    // 每60帧输出一次日志（约1秒）
    if (window.__signals__.frameCount % 60 === 0) {
      console.log(JSON.stringify({
        event: 'position_update',
        frame: window.__signals__.frameCount,
        isMoving: isMoving,
        direction: direction,
        samplePosition: {
          object0: { x: Math.round(this.objects[0].x), y: Math.round(this.objects[0].y) },
          object19: { x: Math.round(this.objects[19].x), y: Math.round(this.objects[19].y) }
        }
      }));
    }
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
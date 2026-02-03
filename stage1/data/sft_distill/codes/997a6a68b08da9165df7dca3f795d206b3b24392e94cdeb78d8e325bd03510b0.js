class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.moveSpeed = 300;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 创建青色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('cyanBox', 40, 40);
    graphics.destroy();

    // 创建 10 个青色对象，均匀分布
    const rows = 2;
    const cols = 5;
    const spacingX = 120;
    const spacingY = 200;
    const startX = 100;
    const startY = 150;

    for (let i = 0; i < 10; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;
      
      const obj = this.add.sprite(x, y, 'cyanBox');
      this.objects.push(obj);
    }

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 初始化可验证信号
    window.__signals__ = {
      objectCount: 10,
      moveSpeed: this.moveSpeed,
      positions: [],
      isMoving: false,
      direction: 'none',
      frameCount: 0
    };

    // 添加文字提示
    this.add.text(10, 10, 'Use Arrow Keys to Move All Objects', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    console.log(JSON.stringify({
      event: 'game_start',
      objectCount: 10,
      speed: this.moveSpeed
    }));
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;
    let velocityX = 0;
    let velocityY = 0;
    let direction = 'none';
    let isMoving = false;

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      velocityX = -this.moveSpeed;
      direction = 'left';
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = this.moveSpeed;
      direction = 'right';
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      velocityY = -this.moveSpeed;
      direction = direction === 'none' ? 'up' : direction + '_up';
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = this.moveSpeed;
      direction = direction === 'none' ? 'down' : direction + '_down';
      isMoving = true;
    }

    // 同步移动所有对象
    const positions = [];
    this.objects.forEach((obj, index) => {
      obj.x += velocityX * deltaSeconds;
      obj.y += velocityY * deltaSeconds;

      // 边界限制（可选）
      obj.x = Phaser.Math.Clamp(obj.x, 20, 780);
      obj.y = Phaser.Math.Clamp(obj.y, 20, 580);

      positions.push({
        id: index,
        x: Math.round(obj.x),
        y: Math.round(obj.y)
      });
    });

    // 更新可验证信号
    window.__signals__.positions = positions;
    window.__signals__.isMoving = isMoving;
    window.__signals__.direction = direction;
    window.__signals__.frameCount++;

    // 每 60 帧输出一次日志
    if (window.__signals__.frameCount % 60 === 0 && isMoving) {
      console.log(JSON.stringify({
        event: 'movement_update',
        frame: window.__signals__.frameCount,
        direction: direction,
        samplePosition: positions[0]
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

const game = new Phaser.Game(config);
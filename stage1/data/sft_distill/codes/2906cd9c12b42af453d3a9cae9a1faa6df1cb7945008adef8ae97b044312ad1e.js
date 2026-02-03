class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.speed = 300;
    this.moveState = { up: false, down: false, left: false, right: false };
  }

  preload() {
    // 创建黄色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFFF00, 1); // 黄色
    graphics.fillCircle(20, 20, 20); // 半径20的圆
    graphics.generateTexture('yellowCircle', 40, 40);
    graphics.destroy();
  }

  create() {
    // 初始化signals对象
    window.__signals__ = {
      objectCount: 15,
      speed: this.speed,
      positions: [],
      moveState: { up: false, down: false, left: false, right: false },
      frame: 0
    };

    // 创建15个黄色对象
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const obj = this.add.sprite(x, y, 'yellowCircle');
      obj.setData('id', i);
      this.objects.push(obj);
    }

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 监听键盘事件以更新移动状态
    this.input.keyboard.on('keydown', (event) => {
      this.updateMoveState();
    });

    this.input.keyboard.on('keyup', (event) => {
      this.updateMoveState();
    });

    // 初始化位置信息
    this.updateSignals();

    console.log('Game initialized with 15 yellow objects');
  }

  updateMoveState() {
    this.moveState.up = this.cursors.up.isDown;
    this.moveState.down = this.cursors.down.isDown;
    this.moveState.left = this.cursors.left.isDown;
    this.moveState.right = this.cursors.right.isDown;
  }

  update(time, delta) {
    // 更新移动状态
    this.updateMoveState();

    // 计算移动向量
    let velocityX = 0;
    let velocityY = 0;

    if (this.moveState.left) {
      velocityX -= this.speed;
    }
    if (this.moveState.right) {
      velocityX += this.speed;
    }
    if (this.moveState.up) {
      velocityY -= this.speed;
    }
    if (this.moveState.down) {
      velocityY += this.speed;
    }

    // 归一化对角线移动速度
    if (velocityX !== 0 && velocityY !== 0) {
      const factor = Math.sqrt(2) / 2;
      velocityX *= factor;
      velocityY *= factor;
    }

    // 同步移动所有对象
    const deltaSeconds = delta / 1000;
    const moveX = velocityX * deltaSeconds;
    const moveY = velocityY * deltaSeconds;

    let hasMovement = moveX !== 0 || moveY !== 0;

    this.objects.forEach(obj => {
      if (hasMovement) {
        obj.x += moveX;
        obj.y += moveY;

        // 边界限制
        obj.x = Phaser.Math.Clamp(obj.x, 20, 780);
        obj.y = Phaser.Math.Clamp(obj.y, 20, 580);
      }
    });

    // 更新signals
    window.__signals__.frame++;
    this.updateSignals();

    // 定期输出日志
    if (window.__signals__.frame % 60 === 0) {
      console.log(JSON.stringify({
        frame: window.__signals__.frame,
        objectCount: window.__signals__.objectCount,
        moveState: window.__signals__.moveState,
        avgPosition: this.getAveragePosition()
      }));
    }
  }

  updateSignals() {
    window.__signals__.positions = this.objects.map(obj => ({
      id: obj.getData('id'),
      x: Math.round(obj.x),
      y: Math.round(obj.y)
    }));

    window.__signals__.moveState = { ...this.moveState };
  }

  getAveragePosition() {
    const sum = this.objects.reduce((acc, obj) => {
      acc.x += obj.x;
      acc.y += obj.y;
      return acc;
    }, { x: 0, y: 0 });

    return {
      x: Math.round(sum.x / this.objects.length),
      y: Math.round(sum.y / this.objects.length)
    };
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
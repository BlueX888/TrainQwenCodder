class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.moveCount = 0; // 可验证的状态信号：移动次数
    this.objects = []; // 存储3个对象
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 生成青色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00FFFF, 1); // 青色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('cyanBox', 40, 40);
    graphics.destroy();

    // 创建3个青色对象，分散在不同位置
    const positions = [
      { x: 200, y: 300 },
      { x: 400, y: 300 },
      { x: 600, y: 300 }
    ];

    positions.forEach(pos => {
      const obj = this.add.sprite(pos.x, pos.y, 'cyanBox');
      this.physics.add.existing(obj);
      obj.body.setCollideWorldBounds(true); // 防止移出屏幕
      this.objects.push(obj);
    });

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示移动次数（调试用）
    this.moveText = this.add.text(10, 10, 'Moves: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 添加说明文字
    this.add.text(10, 40, 'Use Arrow Keys to move all objects', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    console.log('Game initialized. 3 cyan objects created.');
    console.log('Initial moveCount:', this.moveCount);
  }

  update(time, delta) {
    const speed = 240;
    let velocityX = 0;
    let velocityY = 0;
    let isMoving = false;

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      velocityX = -speed;
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = speed;
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      velocityY = -speed;
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = speed;
      isMoving = true;
    }

    // 同步设置所有对象的速度
    this.objects.forEach(obj => {
      obj.body.setVelocity(velocityX, velocityY);
    });

    // 记录移动状态（每次从静止到移动计数一次）
    if (isMoving && !this.wasMoving) {
      this.moveCount++;
      this.moveText.setText('Moves: ' + this.moveCount);
      console.log('Move count:', this.moveCount);
    }
    this.wasMoving = isMoving;
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

const game = new Phaser.Game(config);
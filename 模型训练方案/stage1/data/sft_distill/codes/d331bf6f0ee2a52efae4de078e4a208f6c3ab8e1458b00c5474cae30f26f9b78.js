class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'DOWN'; // UP, DOWN, LEFT, RIGHT
    this.gravityMagnitude = 800;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      gravityDirection: 'DOWN',
      playerX: 400,
      playerY: 300,
      timestamp: Date.now(),
      gravityChanges: 0
    };

    // 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵（带物理属性）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 设置初始重力（向下）
    this.physics.world.gravity.set(0, this.gravityMagnitude);

    // 创建显示文本
    this.gravityText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateGravityText();

    // 创建提示文本
    this.add.text(16, 560, 'Press WASD to change gravity direction', {
      fontSize: '18px',
      fill: '#ffff00'
    });

    // 设置键盘输入
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 监听按键按下事件
    this.keyW.on('down', () => this.setGravity('UP'));
    this.keyA.on('down', () => this.setGravity('LEFT'));
    this.keyS.on('down', () => this.setGravity('DOWN'));
    this.keyD.on('down', () => this.setGravity('RIGHT'));

    // 绘制边界参考线
    const boundaryGraphics = this.add.graphics();
    boundaryGraphics.lineStyle(2, 0x666666, 1);
    boundaryGraphics.strokeRect(0, 0, 800, 600);

    // 添加中心参考点
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 0.5);
    centerGraphics.fillCircle(400, 300, 5);
  }

  setGravity(direction) {
    if (this.gravityDirection === direction) return;

    this.gravityDirection = direction;
    window.__signals__.gravityChanges++;

    switch (direction) {
      case 'UP':
        this.physics.world.gravity.set(0, -this.gravityMagnitude);
        break;
      case 'DOWN':
        this.physics.world.gravity.set(0, this.gravityMagnitude);
        break;
      case 'LEFT':
        this.physics.world.gravity.set(-this.gravityMagnitude, 0);
        break;
      case 'RIGHT':
        this.physics.world.gravity.set(this.gravityMagnitude, 0);
        break;
    }

    this.updateGravityText();
    
    // 记录日志
    console.log(JSON.stringify({
      event: 'gravityChange',
      direction: direction,
      timestamp: Date.now(),
      playerPosition: { x: this.player.x, y: this.player.y }
    }));
  }

  updateGravityText() {
    const arrows = {
      'UP': '↑',
      'DOWN': '↓',
      'LEFT': '←',
      'RIGHT': '→'
    };
    
    this.gravityText.setText(
      `Gravity: ${this.gravityDirection} ${arrows[this.gravityDirection]}\n` +
      `Magnitude: ${this.gravityMagnitude}`
    );
  }

  update(time, delta) {
    // 更新信号
    window.__signals__.gravityDirection = this.gravityDirection;
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.timestamp = Date.now();
    window.__signals__.velocityX = Math.round(this.player.body.velocity.x);
    window.__signals__.velocityY = Math.round(this.player.body.velocity.y);

    // 每秒输出一次状态日志
    if (!this.lastLogTime || time - this.lastLogTime > 1000) {
      this.lastLogTime = time;
      console.log(JSON.stringify({
        event: 'status',
        gravity: this.gravityDirection,
        position: {
          x: Math.round(this.player.x),
          y: Math.round(this.player.y)
        },
        velocity: {
          x: Math.round(this.player.body.velocity.x),
          y: Math.round(this.player.body.velocity.y)
        },
        timestamp: Date.now()
      }));
    }
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
      gravity: { y: 0 }, // 初始重力在 create 中设置
      debug: false
    }
  },
  scene: GravityScene
};

new Phaser.Game(config);
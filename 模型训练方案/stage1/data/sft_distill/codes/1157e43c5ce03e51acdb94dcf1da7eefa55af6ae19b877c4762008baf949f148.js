class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'DOWN'; // UP, DOWN, LEFT, RIGHT
    this.gravityMagnitude = 1000;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（使用Graphics）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵（在场景中心）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 初始重力设置为向下
    this.physics.world.gravity.set(0, this.gravityMagnitude);

    // 创建显示文本
    this.gravityText = this.add.text(16, 16, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateGravityText();

    // 创建键盘输入
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 监听按键按下事件
    this.keyW.on('down', () => this.setGravityDirection('UP'));
    this.keyA.on('down', () => this.setGravityDirection('LEFT'));
    this.keyS.on('down', () => this.setGravityDirection('DOWN'));
    this.keyD.on('down', () => this.setGravityDirection('RIGHT'));

    // 初始化信号对象
    window.__signals__ = {
      gravityDirection: this.gravityDirection,
      playerX: this.player.x,
      playerY: this.player.y,
      gravityX: 0,
      gravityY: this.gravityMagnitude,
      frameCount: 0
    };

    // 添加说明文本
    this.add.text(16, 560, 'Press W/A/S/D to change gravity direction', {
      fontSize: '18px',
      color: '#ffff00'
    });
  }

  setGravityDirection(direction) {
    this.gravityDirection = direction;
    
    // 根据方向设置世界重力
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
    
    // 记录重力切换日志
    console.log(JSON.stringify({
      event: 'gravityChanged',
      direction: direction,
      gravityX: this.physics.world.gravity.x,
      gravityY: this.physics.world.gravity.y,
      timestamp: Date.now()
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
      `Magnitude: ${this.gravityMagnitude}\n` +
      `Vector: (${this.physics.world.gravity.x}, ${this.physics.world.gravity.y})`
    );
  }

  update(time, delta) {
    // 更新验证信号
    window.__signals__.gravityDirection = this.gravityDirection;
    window.__signals__.playerX = Math.round(this.player.x * 100) / 100;
    window.__signals__.playerY = Math.round(this.player.y * 100) / 100;
    window.__signals__.gravityX = this.physics.world.gravity.x;
    window.__signals__.gravityY = this.physics.world.gravity.y;
    window.__signals__.frameCount++;
    window.__signals__.velocityX = Math.round(this.player.body.velocity.x * 100) / 100;
    window.__signals__.velocityY = Math.round(this.player.body.velocity.y * 100) / 100;

    // 每60帧输出一次状态日志（约1秒）
    if (window.__signals__.frameCount % 60 === 0) {
      console.log(JSON.stringify({
        event: 'statusUpdate',
        frame: window.__signals__.frameCount,
        gravity: this.gravityDirection,
        position: {
          x: window.__signals__.playerX,
          y: window.__signals__.playerY
        },
        velocity: {
          x: window.__signals__.velocityX,
          y: window.__signals__.velocityY
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
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1000 }, // 初始重力向下
      debug: false
    }
  },
  scene: GravityScene
};

new Phaser.Game(config);
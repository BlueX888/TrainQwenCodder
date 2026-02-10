class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'DOWN'; // 'UP' or 'DOWN'
    this.gravityValue = 400;
    this.signals = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（程序化生成）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建地板和天花板纹理
    const floorGraphics = this.add.graphics();
    floorGraphics.fillStyle(0x8b4513, 1);
    floorGraphics.fillRect(0, 0, 800, 40);
    floorGraphics.generateTexture('floor', 800, 40);
    floorGraphics.destroy();

    // 创建玩家精灵（物理对象）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);
    
    // 设置初始重力（向下）
    this.player.body.setGravityY(this.gravityValue);

    // 创建地板和天花板（静态物理对象）
    this.floor = this.physics.add.staticSprite(400, 580, 'floor');
    this.ceiling = this.physics.add.staticSprite(400, 20, 'floor');

    // 添加碰撞
    this.physics.add.collider(this.player, this.floor);
    this.physics.add.collider(this.player, this.ceiling);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建显示文本
    this.gravityText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateGravityText();

    // 创建位置文本
    this.positionText = this.add.text(16, 56, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建提示文本
    this.add.text(400, 300, 'Press UP/DOWN arrow keys\nto change gravity direction', {
      fontSize: '20px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    // 初始化 signals
    window.__signals__ = this.signals;
    this.logSignal('GAME_START', { gravity: this.gravityDirection, value: this.gravityValue });

    // 上一次按键状态
    this.lastUpPressed = false;
    this.lastDownPressed = false;
  }

  update(time, delta) {
    // 检测上方向键（切换到向上重力）
    if (this.cursors.up.isDown && !this.lastUpPressed) {
      this.setGravityDirection('UP');
    }
    this.lastUpPressed = this.cursors.up.isDown;

    // 检测下方向键（切换到向下重力）
    if (this.cursors.down.isDown && !this.lastDownPressed) {
      this.setGravityDirection('DOWN');
    }
    this.lastDownPressed = this.cursors.down.isDown;

    // 更新位置文本
    this.positionText.setText(
      `Position: X=${Math.round(this.player.x)}, Y=${Math.round(this.player.y)}\n` +
      `Velocity: VX=${Math.round(this.player.body.velocity.x)}, VY=${Math.round(this.player.body.velocity.y)}`
    );

    // 每秒记录一次位置信号
    if (Math.floor(time / 1000) !== this.lastLogTime) {
      this.lastLogTime = Math.floor(time / 1000);
      this.logSignal('POSITION_UPDATE', {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        velocityY: Math.round(this.player.body.velocity.y),
        gravity: this.gravityDirection
      });
    }
  }

  setGravityDirection(direction) {
    if (this.gravityDirection === direction) {
      return; // 已经是该方向，不重复设置
    }

    this.gravityDirection = direction;
    
    if (direction === 'UP') {
      // 向上重力（负值）
      this.player.body.setGravityY(-this.gravityValue);
    } else {
      // 向下重力（正值）
      this.player.body.setGravityY(this.gravityValue);
    }

    this.updateGravityText();
    this.logSignal('GRAVITY_CHANGE', {
      direction: direction,
      value: direction === 'UP' ? -this.gravityValue : this.gravityValue,
      playerY: Math.round(this.player.y)
    });
  }

  updateGravityText() {
    const arrow = this.gravityDirection === 'UP' ? '↑' : '↓';
    this.gravityText.setText(`Gravity: ${arrow} ${this.gravityDirection} (${this.gravityValue})`);
  }

  logSignal(event, data) {
    const signal = {
      timestamp: Date.now(),
      event: event,
      data: data
    };
    this.signals.push(signal);
    console.log('[SIGNAL]', JSON.stringify(signal));
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
      gravity: { y: 0 }, // 关闭世界重力，使用精灵自身重力
      debug: false
    }
  },
  scene: GravityScene
};

new Phaser.Game(config);
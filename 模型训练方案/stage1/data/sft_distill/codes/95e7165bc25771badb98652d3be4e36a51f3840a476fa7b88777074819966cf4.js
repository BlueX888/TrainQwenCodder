class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'DOWN'; // 状态信号：当前重力方向
    this.switchCount = 0; // 状态信号：切换次数
  }

  preload() {
    // 使用Graphics创建玩家纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 创建玩家精灵，位于屏幕中央
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 设置初始重力（向下）
    this.physics.world.gravity.x = 0;
    this.physics.world.gravity.y = 400;

    // 创建键盘输入
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 创建显示文本
    this.gravityText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statsText = this.add.text(16, 60, '', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 更新显示
    this.updateDisplay();

    // 监听按键事件
    this.keyW.on('down', () => this.setGravity('UP'));
    this.keyA.on('down', () => this.setGravity('LEFT'));
    this.keyS.on('down', () => this.setGravity('DOWN'));
    this.keyD.on('down', () => this.setGravity('RIGHT'));
  }

  setGravity(direction) {
    // 如果方向相同，不重复设置
    if (this.gravityDirection === direction) {
      return;
    }

    this.gravityDirection = direction;
    this.switchCount++;

    // 根据方向设置重力
    switch (direction) {
      case 'UP':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = -400;
        break;
      case 'DOWN':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = 400;
        break;
      case 'LEFT':
        this.physics.world.gravity.x = -400;
        this.physics.world.gravity.y = 0;
        break;
      case 'RIGHT':
        this.physics.world.gravity.x = 400;
        this.physics.world.gravity.y = 0;
        break;
    }

    // 更新显示
    this.updateDisplay();
  }

  updateDisplay() {
    // 显示当前重力方向
    const arrows = {
      'UP': '↑',
      'DOWN': '↓',
      'LEFT': '←',
      'RIGHT': '→'
    };

    this.gravityText.setText(
      `Gravity Direction: ${this.gravityDirection} ${arrows[this.gravityDirection]}\n` +
      `Gravity: (${this.physics.world.gravity.x}, ${this.physics.world.gravity.y})`
    );

    // 显示状态信号
    this.statsText.setText(
      `Switch Count: ${this.switchCount}\n` +
      `Player Pos: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
      `Player Velocity: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`
    );
  }

  update(time, delta) {
    // 每帧更新显示（位置和速度实时变化）
    this.statsText.setText(
      `Switch Count: ${this.switchCount}\n` +
      `Player Pos: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
      `Player Velocity: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`
    );

    // 添加指示说明（首次显示）
    if (!this.instructionText && time > 100) {
      this.instructionText = this.add.text(400, 550, 
        'Press W/A/S/D to change gravity direction', {
        fontSize: '20px',
        fill: '#00ffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      });
      this.instructionText.setOrigin(0.5);
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
      gravity: { y: 400 }, // 初始重力向下
      debug: false
    }
  },
  scene: GravityScene
};

new Phaser.Game(config);
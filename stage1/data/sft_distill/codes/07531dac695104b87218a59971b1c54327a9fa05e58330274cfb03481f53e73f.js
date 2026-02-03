class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'DOWN'; // 可验证状态：当前重力方向
    this.gravityMagnitude = 400;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建玩家纹理（使用Graphics）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeCircle(16, 16, 16);
    graphics.generateTexture('playerTex', 32, 32);
    graphics.destroy();

    // 创建玩家精灵（物理对象）
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 设置初始重力（向下）
    this.physics.world.gravity.x = 0;
    this.physics.world.gravity.y = this.gravityMagnitude;

    // 创建显示文本
    this.gravityText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateGravityText();

    // 创建说明文本
    this.add.text(16, 560, 'Press W/A/S/D to change gravity direction', {
      fontSize: '18px',
      fill: '#ffff00'
    });

    // 监听WASD键
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 监听按键按下事件（使用once确保每次按键只触发一次）
    this.keyW.on('down', () => this.setGravity('UP'));
    this.keyA.on('down', () => this.setGravity('LEFT'));
    this.keyS.on('down', () => this.setGravity('DOWN'));
    this.keyD.on('down', () => this.setGravity('RIGHT'));

    // 添加调试信息文本
    this.debugText = this.add.text(16, 60, '', {
      fontSize: '16px',
      fill: '#cccccc'
    });
  }

  setGravity(direction) {
    this.gravityDirection = direction;
    
    // 重置重力
    this.physics.world.gravity.x = 0;
    this.physics.world.gravity.y = 0;

    // 根据方向设置重力
    switch (direction) {
      case 'UP':
        this.physics.world.gravity.y = -this.gravityMagnitude;
        break;
      case 'DOWN':
        this.physics.world.gravity.y = this.gravityMagnitude;
        break;
      case 'LEFT':
        this.physics.world.gravity.x = -this.gravityMagnitude;
        break;
      case 'RIGHT':
        this.physics.world.gravity.x = this.gravityMagnitude;
        break;
    }

    // 更新显示文本
    this.updateGravityText();

    // 稍微减速以便观察重力切换效果
    this.player.setVelocity(
      this.player.body.velocity.x * 0.5,
      this.player.body.velocity.y * 0.5
    );
  }

  updateGravityText() {
    const arrows = {
      'UP': '↑',
      'DOWN': '↓',
      'LEFT': '←',
      'RIGHT': '→'
    };
    
    this.gravityText.setText(
      `Gravity: ${arrows[this.gravityDirection]} ${this.gravityDirection} (${this.gravityMagnitude})`
    );
  }

  update(time, delta) {
    // 更新调试信息
    this.debugText.setText([
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Velocity: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`,
      `World Gravity: (${this.physics.world.gravity.x}, ${this.physics.world.gravity.y})`
    ]);

    // 边界检测和反弹效果（已通过setCollideWorldBounds处理）
    // 可选：添加视觉反馈
    const alpha = Phaser.Math.Clamp(1 - this.player.body.speed / 500, 0.6, 1);
    this.player.setAlpha(alpha);
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
      gravity: { x: 0, y: 400 },
      debug: false
    }
  },
  scene: GravityScene
};

new Phaser.Game(config);
class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 'up', 'down', 'left', 'right'
    this.gravityMagnitude = 800;
  }

  preload() {
    // 生成玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成平台纹理
    const platformGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 64, 16);
    platformGraphics.generateTexture('platform', 64, 16);
    platformGraphics.destroy();
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建静态平台组（四周边界）
    const platforms = this.physics.add.staticGroup();
    
    // 地面
    for (let x = 0; x < width; x += 64) {
      platforms.create(x + 32, height - 8, 'platform');
    }
    
    // 天花板
    for (let x = 0; x < width; x += 64) {
      platforms.create(x + 32, 8, 'platform');
    }
    
    // 左墙
    for (let y = 16; y < height - 16; y += 16) {
      platforms.create(8, y, 'platform').setDisplaySize(16, 16);
    }
    
    // 右墙
    for (let y = 16; y < height - 16; y += 16) {
      platforms.create(width - 8, y, 'platform').setDisplaySize(16, 16);
    }

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);
    
    // 初始重力设置为向下
    this.player.body.setGravityY(this.gravityMagnitude);

    // 添加碰撞
    this.physics.add.collider(this.player, platforms);

    // 创建键盘输入
    this.keys = {
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 创建显示文本
    this.gravityText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.gravityText.setDepth(100);

    // 创建说明文本
    this.add.text(16, height - 80, 'WASD: Change Gravity Direction\nW=Up, S=Down, A=Left, D=Right', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });

    // 初始化signals
    window.__signals__ = {
      gravityDirection: this.gravityDirection,
      playerX: Math.round(this.player.x),
      playerY: Math.round(this.player.y),
      gravityX: 0,
      gravityY: this.gravityMagnitude,
      timestamp: Date.now()
    };

    this.updateGravityDisplay();
  }

  update(time, delta) {
    // 检测WASD按键
    if (Phaser.Input.Keyboard.JustDown(this.keys.w)) {
      this.setGravity('up');
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.s)) {
      this.setGravity('down');
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.a)) {
      this.setGravity('left');
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.d)) {
      this.setGravity('right');
    }

    // 更新signals
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.playerVelocityX = Math.round(this.player.body.velocity.x);
    window.__signals__.playerVelocityY = Math.round(this.player.body.velocity.y);
    window.__signals__.timestamp = Date.now();
  }

  setGravity(direction) {
    this.gravityDirection = direction;
    
    // 重置重力
    this.player.body.setGravityX(0);
    this.player.body.setGravityY(0);

    // 根据方向设置重力
    switch (direction) {
      case 'up':
        this.player.body.setGravityY(-this.gravityMagnitude);
        break;
      case 'down':
        this.player.body.setGravityY(this.gravityMagnitude);
        break;
      case 'left':
        this.player.body.setGravityX(-this.gravityMagnitude);
        break;
      case 'right':
        this.player.body.setGravityX(this.gravityMagnitude);
        break;
    }

    // 更新显示
    this.updateGravityDisplay();

    // 更新signals
    window.__signals__.gravityDirection = this.gravityDirection;
    window.__signals__.gravityX = this.player.body.gravity.x;
    window.__signals__.gravityY = this.player.body.gravity.y;

    // 输出日志
    console.log(JSON.stringify({
      event: 'gravityChanged',
      direction: this.gravityDirection,
      gravityX: this.player.body.gravity.x,
      gravityY: this.player.body.gravity.y,
      timestamp: Date.now()
    }));
  }

  updateGravityDisplay() {
    const arrows = {
      up: '↑',
      down: '↓',
      left: '←',
      right: '→'
    };
    
    this.gravityText.setText(
      `Gravity Direction: ${this.gravityDirection.toUpperCase()} ${arrows[this.gravityDirection]}\n` +
      `Gravity: ${this.gravityMagnitude}\n` +
      `X: ${this.player.body.gravity.x} | Y: ${this.player.body.gravity.y}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // 世界重力为0，通过Body控制
      debug: false
    }
  },
  scene: GravityScene
};

new Phaser.Game(config);
// 四向重力切换游戏
class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravitySwitchCount = 0;
    this.currentGravityDirection = 'down'; // down, up, left, right
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建纹理
    this.createTextures();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height / 2, 'playerTex');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);

    // 创建12个物体（使用固定种子确保可重现）
    this.objects = this.physics.add.group();
    const seed = 12345;
    let rng = this.createSeededRandom(seed);

    for (let i = 0; i < 12; i++) {
      const x = rng() * (width - 100) + 50;
      const y = rng() * (height - 100) + 50;
      const obj = this.objects.create(x, y, 'objectTex');
      obj.setCollideWorldBounds(true);
      obj.setBounce(0.5);
      obj.setVelocity(
        (rng() - 0.5) * 100,
        (rng() - 0.5) * 100
      );
    }

    // 物体间碰撞
    this.physics.add.collider(this.objects, this.objects);
    this.physics.add.collider(this.player, this.objects);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 初始化信号
    window.__signals__ = {
      gravitySwitchCount: 0,
      currentGravityDirection: 'down',
      playerPosition: { x: this.player.x, y: this.player.y },
      objectCount: 12
    };

    // 显示提示文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateInfoText();
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('playerTex', 32, 32);
    playerGraphics.destroy();

    // 创建物体纹理（红色圆形）
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xff4444, 1);
    objectGraphics.fillCircle(12, 12, 12);
    objectGraphics.generateTexture('objectTex', 24, 24);
    objectGraphics.destroy();
  }

  createSeededRandom(seed) {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }

  update(time, delta) {
    // 检测方向键按下（使用 justDown 避免重复触发）
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.setGravity('up');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.setGravity('down');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.setGravity('left');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.setGravity('right');
    }

    // 更新信号
    this.updateSignals();
  }

  setGravity(direction) {
    const gravityStrength = 200;
    const world = this.physics.world;

    switch (direction) {
      case 'up':
        world.gravity.x = 0;
        world.gravity.y = -gravityStrength;
        break;
      case 'down':
        world.gravity.x = 0;
        world.gravity.y = gravityStrength;
        break;
      case 'left':
        world.gravity.x = -gravityStrength;
        world.gravity.y = 0;
        break;
      case 'right':
        world.gravity.x = gravityStrength;
        world.gravity.y = 0;
        break;
    }

    this.currentGravityDirection = direction;
    this.gravitySwitchCount++;

    this.updateInfoText();
    this.logGravityChange(direction);
  }

  updateInfoText() {
    const text = [
      `Gravity Direction: ${this.currentGravityDirection.toUpperCase()}`,
      `Switch Count: ${this.gravitySwitchCount}`,
      `Press Arrow Keys to Change Gravity`,
      `Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    ].join('\n');
    
    this.infoText.setText(text);
  }

  updateSignals() {
    window.__signals__ = {
      gravitySwitchCount: this.gravitySwitchCount,
      currentGravityDirection: this.currentGravityDirection,
      playerPosition: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y)
      },
      objectCount: this.objects.getChildren().length,
      gravityVector: {
        x: this.physics.world.gravity.x,
        y: this.physics.world.gravity.y
      }
    };
  }

  logGravityChange(direction) {
    const logEntry = {
      timestamp: Date.now(),
      event: 'gravitySwitch',
      direction: direction,
      switchCount: this.gravitySwitchCount,
      playerPosition: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y)
      }
    };
    
    console.log(JSON.stringify(logEntry));
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 200 }, // 初始重力向下
      debug: false
    }
  },
  scene: GravityScene
};

// 启动游戏
const game = new Phaser.Game(config);
class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.gravityMagnitude = 1000;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建物体纹理（红色圆形）
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xff4444, 1);
    objectGraphics.fillCircle(15, 15, 15);
    objectGraphics.generateTexture('object', 30, 30);
    objectGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 创建10个物体
    this.objects = [];
    const seed = 12345; // 固定随机种子
    let random = this.createSeededRandom(seed);
    
    for (let i = 0; i < 10; i++) {
      const x = 100 + random() * 600;
      const y = 50 + random() * 500;
      const obj = this.physics.add.sprite(x, y, 'object');
      obj.setBounce(0.4);
      obj.setCollideWorldBounds(true);
      this.objects.push(obj);
    }

    // 设置物体之间的碰撞
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加WASD键作为备选
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 初始化重力方向为向下
    this.physics.world.gravity.set(0, this.gravityMagnitude);

    // 创建UI文本显示当前重力方向
    this.gravityText = this.add.text(16, 16, 'Gravity: DOWN', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.gravityText.setScrollFactor(0);
    this.gravityText.setDepth(100);

    // 创建说明文本
    this.instructionText = this.add.text(16, 560, 'Arrow Keys: Change Gravity Direction', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 记录上一次按键状态，避免重复触发
    this.lastKeyState = {
      up: false,
      down: false,
      left: false,
      right: false
    };
  }

  update() {
    // 检测方向键按下（只在按下瞬间触发）
    if ((this.cursors.up.isDown || this.keys.w.isDown) && !this.lastKeyState.up) {
      this.setGravity('up');
      this.lastKeyState.up = true;
    } else if (!this.cursors.up.isDown && !this.keys.w.isDown) {
      this.lastKeyState.up = false;
    }

    if ((this.cursors.down.isDown || this.keys.s.isDown) && !this.lastKeyState.down) {
      this.setGravity('down');
      this.lastKeyState.down = true;
    } else if (!this.cursors.down.isDown && !this.keys.s.isDown) {
      this.lastKeyState.down = false;
    }

    if ((this.cursors.left.isDown || this.keys.a.isDown) && !this.lastKeyState.left) {
      this.setGravity('left');
      this.lastKeyState.left = true;
    } else if (!this.cursors.left.isDown && !this.keys.a.isDown) {
      this.lastKeyState.left = false;
    }

    if ((this.cursors.right.isDown || this.keys.d.isDown) && !this.lastKeyState.right) {
      this.setGravity('right');
      this.lastKeyState.right = true;
    } else if (!this.cursors.right.isDown && !this.keys.d.isDown) {
      this.lastKeyState.right = false;
    }
  }

  setGravity(direction) {
    this.gravityDirection = direction; // 更新状态信号
    
    switch(direction) {
      case 'up':
        this.physics.world.gravity.set(0, -this.gravityMagnitude);
        this.gravityText.setText('Gravity: UP');
        break;
      case 'down':
        this.physics.world.gravity.set(0, this.gravityMagnitude);
        this.gravityText.setText('Gravity: DOWN');
        break;
      case 'left':
        this.physics.world.gravity.set(-this.gravityMagnitude, 0);
        this.gravityText.setText('Gravity: LEFT');
        break;
      case 'right':
        this.physics.world.gravity.set(this.gravityMagnitude, 0);
        this.gravityText.setText('Gravity: RIGHT');
        break;
    }
  }

  // 创建可重复的随机数生成器
  createSeededRandom(seed) {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
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
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: GravityScene
};

new Phaser.Game(config);
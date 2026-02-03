class GravityGame extends Phaser.Scene {
  constructor() {
    super('GravityGame');
    this.gravitySwitchCount = 0;
    this.currentGravityDirection = 'down';
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建物体纹理
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xff6600, 1);
    objectGraphics.fillRect(0, 0, 24, 24);
    objectGraphics.generateTexture('object', 24, 24);
    objectGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 创建10个物体（使用固定种子生成位置）
    this.objects = this.physics.add.group();
    const rng = this.createSeededRandom(this.seed);
    
    for (let i = 0; i < 10; i++) {
      const x = rng() * 700 + 50; // 50-750
      const y = rng() * 500 + 50; // 50-550
      const obj = this.objects.create(x, y, 'object');
      obj.setBounce(0.4);
      obj.setCollideWorldBounds(true);
    }

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加WASD键作为备用
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

    // 状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 说明文本
    this.instructionText = this.add.text(10, 550, 
      'Use Arrow Keys to switch gravity direction', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    // 初始化重力方向指示器
    this.gravityIndicator = this.add.graphics();
    
    this.updateStatus();
  }

  update() {
    // 检测方向键按下（使用 justDown 避免重复触发）
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
        Phaser.Input.Keyboard.JustDown(this.keys.w)) {
      this.setGravity('up');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || 
               Phaser.Input.Keyboard.JustDown(this.keys.s)) {
      this.setGravity('down');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || 
               Phaser.Input.Keyboard.JustDown(this.keys.a)) {
      this.setGravity('left');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || 
               Phaser.Input.Keyboard.JustDown(this.keys.d)) {
      this.setGravity('right');
    }

    this.updateGravityIndicator();
  }

  setGravity(direction) {
    const gravityStrength = 500;
    
    // 如果方向相同，不重复设置
    if (this.currentGravityDirection === direction) {
      return;
    }

    switch(direction) {
      case 'up':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = -gravityStrength;
        break;
      case 'down':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = gravityStrength;
        break;
      case 'left':
        this.physics.world.gravity.x = -gravityStrength;
        this.physics.world.gravity.y = 0;
        break;
      case 'right':
        this.physics.world.gravity.x = gravityStrength;
        this.physics.world.gravity.y = 0;
        break;
    }

    this.currentGravityDirection = direction;
    this.gravitySwitchCount++;
    this.updateStatus();
  }

  updateStatus() {
    this.statusText.setText([
      `Gravity: ${this.currentGravityDirection.toUpperCase()}`,
      `Switches: ${this.gravitySwitchCount}`,
      `Objects: ${this.objects.getChildren().length}`,
      `Player: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    ]);
  }

  updateGravityIndicator() {
    this.gravityIndicator.clear();
    this.gravityIndicator.lineStyle(3, 0xffff00, 1);
    this.gravityIndicator.fillStyle(0xffff00, 1);

    const centerX = 750;
    const centerY = 30;
    const length = 20;

    // 绘制重力方向箭头
    switch(this.currentGravityDirection) {
      case 'up':
        this.gravityIndicator.beginPath();
        this.gravityIndicator.moveTo(centerX, centerY);
        this.gravityIndicator.lineTo(centerX, centerY - length);
        this.gravityIndicator.lineTo(centerX - 5, centerY - length + 8);
        this.gravityIndicator.moveTo(centerX, centerY - length);
        this.gravityIndicator.lineTo(centerX + 5, centerY - length + 8);
        this.gravityIndicator.strokePath();
        break;
      case 'down':
        this.gravityIndicator.beginPath();
        this.gravityIndicator.moveTo(centerX, centerY);
        this.gravityIndicator.lineTo(centerX, centerY + length);
        this.gravityIndicator.lineTo(centerX - 5, centerY + length - 8);
        this.gravityIndicator.moveTo(centerX, centerY + length);
        this.gravityIndicator.lineTo(centerX + 5, centerY + length - 8);
        this.gravityIndicator.strokePath();
        break;
      case 'left':
        this.gravityIndicator.beginPath();
        this.gravityIndicator.moveTo(centerX, centerY);
        this.gravityIndicator.lineTo(centerX - length, centerY);
        this.gravityIndicator.lineTo(centerX - length + 8, centerY - 5);
        this.gravityIndicator.moveTo(centerX - length, centerY);
        this.gravityIndicator.lineTo(centerX - length + 8, centerY + 5);
        this.gravityIndicator.strokePath();
        break;
      case 'right':
        this.gravityIndicator.beginPath();
        this.gravityIndicator.moveTo(centerX, centerY);
        this.gravityIndicator.lineTo(centerX + length, centerY);
        this.gravityIndicator.lineTo(centerX + length - 8, centerY - 5);
        this.gravityIndicator.moveTo(centerX + length, centerY);
        this.gravityIndicator.lineTo(centerX + length - 8, centerY + 5);
        this.gravityIndicator.strokePath();
        break;
    }
  }

  // 创建固定种子的随机数生成器
  createSeededRandom(seed) {
    let currentSeed = seed;
    return function() {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
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
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: GravityGame
};

new Phaser.Game(config);
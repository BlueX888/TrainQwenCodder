class GravityGameScene extends Phaser.Scene {
  constructor() {
    super('GravityGameScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.objectCount = 15; // 状态信号：物体数量
    this.switchCount = 0; // 状态信号：重力切换次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const graphics = this.add.graphics();
    
    // 生成玩家纹理（蓝色方块）
    graphics.fillStyle(0x3498db, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.clear();
    
    // 生成物体纹理（红色圆形）
    graphics.fillStyle(0xe74c3c, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('object', 32, 32);
    graphics.clear();
    
    // 创建玩家
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);
    
    // 创建15个物体
    this.objects = this.physics.add.group();
    
    // 使用固定种子生成确定性位置
    const seed = 12345;
    let random = this.seededRandom(seed);
    
    for (let i = 0; i < this.objectCount; i++) {
      const x = 100 + random() * 600;
      const y = 100 + random() * 400;
      const obj = this.objects.create(x, y, 'object');
      obj.setBounce(0.5);
      obj.setCollideWorldBounds(true);
    }
    
    // 添加玩家与物体的碰撞
    this.physics.add.collider(this.player, this.objects);
    
    // 添加物体之间的碰撞
    this.physics.add.collider(this.objects, this.objects);
    
    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // 创建UI文本显示状态
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setDepth(100);
    
    // 添加指示箭头（显示当前重力方向）
    this.createGravityArrow();
    
    this.updateStatusText();
  }

  update(time, delta) {
    // 检测重力切换输入
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
        Phaser.Input.Keyboard.JustDown(this.wasd.up)) {
      this.setGravity('up');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || 
               Phaser.Input.Keyboard.JustDown(this.wasd.down)) {
      this.setGravity('down');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || 
               Phaser.Input.Keyboard.JustDown(this.wasd.left)) {
      this.setGravity('left');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || 
               Phaser.Input.Keyboard.JustDown(this.wasd.right)) {
      this.setGravity('right');
    }
    
    this.updateStatusText();
  }

  setGravity(direction) {
    const GRAVITY = 1000;
    
    switch(direction) {
      case 'up':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = -GRAVITY;
        break;
      case 'down':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = GRAVITY;
        break;
      case 'left':
        this.physics.world.gravity.x = -GRAVITY;
        this.physics.world.gravity.y = 0;
        break;
      case 'right':
        this.physics.world.gravity.x = GRAVITY;
        this.physics.world.gravity.y = 0;
        break;
    }
    
    this.gravityDirection = direction;
    this.switchCount++;
    this.updateGravityArrow();
  }

  createGravityArrow() {
    const graphics = this.add.graphics();
    graphics.lineStyle(4, 0xffff00, 1);
    graphics.fillStyle(0xffff00, 1);
    
    // 绘制箭头主体
    graphics.beginPath();
    graphics.moveTo(0, -30);
    graphics.lineTo(0, 30);
    graphics.strokePath();
    
    // 绘制箭头头部
    graphics.beginPath();
    graphics.moveTo(-10, 20);
    graphics.lineTo(0, 30);
    graphics.lineTo(10, 20);
    graphics.fillPath();
    
    graphics.generateTexture('arrow', 32, 64);
    graphics.destroy();
    
    this.gravityArrow = this.add.image(750, 50, 'arrow');
    this.gravityArrow.setDepth(100);
    this.updateGravityArrow();
  }

  updateGravityArrow() {
    switch(this.gravityDirection) {
      case 'up':
        this.gravityArrow.setAngle(180);
        break;
      case 'down':
        this.gravityArrow.setAngle(0);
        break;
      case 'left':
        this.gravityArrow.setAngle(90);
        break;
      case 'right':
        this.gravityArrow.setAngle(-90);
        break;
    }
  }

  updateStatusText() {
    const text = `Gravity: ${this.gravityDirection.toUpperCase()}\n` +
                 `Objects: ${this.objectCount}\n` +
                 `Switches: ${this.switchCount}\n` +
                 `Press Arrow Keys or WASD to change gravity`;
    this.statusText.setText(text);
  }

  // 简单的伪随机数生成器（确保确定性）
  seededRandom(seed) {
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
  backgroundColor: '#2c3e50',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: GravityGameScene
};

new Phaser.Game(config);
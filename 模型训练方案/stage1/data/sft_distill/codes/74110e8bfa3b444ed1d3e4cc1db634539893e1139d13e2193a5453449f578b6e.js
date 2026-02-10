class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.gravityMagnitude = 1000;
    this.switchCount = 0; // 状态信号：切换次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成物体纹理（红色圆形）
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xff3333, 1);
    objectGraphics.fillCircle(12, 12, 12);
    objectGraphics.generateTexture('object', 24, 24);
    objectGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 创建物体组
    this.objects = this.physics.add.group({
      key: 'object',
      repeat: 9, // 总共10个物体
      bounceX: 0.4,
      bounceY: 0.4,
      collideWorldBounds: true
    });

    // 使用固定种子的随机数生成器分布物体
    const seed = 12345;
    let randomState = seed;
    const seededRandom = () => {
      randomState = (randomState * 9301 + 49297) % 233280;
      return randomState / 233280;
    };

    // 随机分布物体位置
    this.objects.children.entries.forEach((obj, index) => {
      const x = 100 + seededRandom() * 600;
      const y = 100 + seededRandom() * 400;
      obj.setPosition(x, y);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示当前重力方向
    this.gravityText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(16, 560, 'Use Arrow Keys to change gravity direction', {
      fontSize: '16px',
      fill: '#ffff00'
    });

    this.updateGravityText();
  }

  update() {
    // 检测方向键按下并切换重力
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.setGravity('up');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.setGravity('down');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.setGravity('left');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.setGravity('right');
    }
  }

  setGravity(direction) {
    const magnitude = this.gravityMagnitude;
    
    switch(direction) {
      case 'up':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = -magnitude;
        break;
      case 'down':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = magnitude;
        break;
      case 'left':
        this.physics.world.gravity.x = -magnitude;
        this.physics.world.gravity.y = 0;
        break;
      case 'right':
        this.physics.world.gravity.x = magnitude;
        this.physics.world.gravity.y = 0;
        break;
    }

    this.gravityDirection = direction;
    this.switchCount++;
    this.updateGravityText();
  }

  updateGravityText() {
    this.gravityText.setText(
      `Gravity: ${this.gravityDirection.toUpperCase()}\n` +
      `Switches: ${this.switchCount}\n` +
      `G: (${this.physics.world.gravity.x}, ${this.physics.world.gravity.y})`
    );
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
      gravity: { x: 0, y: 1000 },
      debug: false
    }
  },
  scene: GravityScene
};

const game = new Phaser.Game(config);
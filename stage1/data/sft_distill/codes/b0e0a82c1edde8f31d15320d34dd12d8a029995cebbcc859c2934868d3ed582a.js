class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.currentGravityDirection = 'down'; // 状态信号：当前重力方向
    this.gravitySwitchCount = 0; // 状态信号：重力切换次数
    this.gravityMagnitude = 200;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
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

    // 创建玩家（绿色圆形）
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);

    // 创建 8 个物体（橙色方块）
    this.objects = [];
    const positions = [
      { x: 150, y: 150 },
      { x: 650, y: 150 },
      { x: 150, y: 450 },
      { x: 650, y: 450 },
      { x: 300, y: 250 },
      { x: 500, y: 250 },
      { x: 300, y: 350 },
      { x: 500, y: 350 }
    ];

    for (let i = 0; i < 8; i++) {
      const obj = this.physics.add.sprite(positions[i].x, positions[i].y, 'object');
      obj.setCollideWorldBounds(true);
      obj.setBounce(0.4);
      this.objects.push(obj);
    }

    // 添加物体之间的碰撞
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加提示文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化重力方向
    this.setGravity('down');
    this.updateInfoText();
  }

  update(time, delta) {
    // 检测方向键输入并切换重力
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.setGravity('up');
      this.gravitySwitchCount++;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.setGravity('down');
      this.gravitySwitchCount++;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.setGravity('left');
      this.gravitySwitchCount++;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.setGravity('right');
      this.gravitySwitchCount++;
    }

    this.updateInfoText();
  }

  setGravity(direction) {
    this.currentGravityDirection = direction;
    
    switch (direction) {
      case 'up':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = -this.gravityMagnitude;
        break;
      case 'down':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = this.gravityMagnitude;
        break;
      case 'left':
        this.physics.world.gravity.x = -this.gravityMagnitude;
        this.physics.world.gravity.y = 0;
        break;
      case 'right':
        this.physics.world.gravity.x = this.gravityMagnitude;
        this.physics.world.gravity.y = 0;
        break;
    }
  }

  updateInfoText() {
    const directionSymbol = {
      'up': '↑',
      'down': '↓',
      'left': '←',
      'right': '→'
    };

    this.infoText.setText([
      `Gravity Direction: ${directionSymbol[this.currentGravityDirection]} ${this.currentGravityDirection.toUpperCase()}`,
      `Gravity Magnitude: ${this.gravityMagnitude}`,
      `Switch Count: ${this.gravitySwitchCount}`,
      ``,
      `Press Arrow Keys to Change Gravity`
    ]);
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
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: GravityScene
};

new Phaser.Game(config);
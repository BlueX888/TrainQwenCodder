class GravitySwitchScene extends Phaser.Scene {
  constructor() {
    super('GravitySwitchScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.switchCount = 0; // 状态信号：切换次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建物体纹理（红色圆形）
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xe74c3c, 1);
    objectGraphics.fillCircle(15, 15, 15);
    objectGraphics.generateTexture('object', 30, 30);
    objectGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);

    // 创建 8 个物体（使用固定种子确保位置确定性）
    this.objects = this.physics.add.group();
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 150 },
      { x: 200, y: 300 },
      { x: 600, y: 300 },
      { x: 400, y: 450 }
    ];

    positions.forEach(pos => {
      const obj = this.objects.create(pos.x, pos.y, 'object');
      obj.setCollideWorldBounds(true);
      obj.setBounce(0.5);
    });

    // 设置物体之间的碰撞
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加 WASD 键作为备用
    this.keys = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
    };

    // 创建提示文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建边界线帮助可视化
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 0.5);
    graphics.strokeRect(0, 0, width, height);

    this.updateInfoText();
  }

  update() {
    // 检测方向键按下（使用 JustDown 避免重复触发）
    if (Phaser.Input.Keyboard.JustDown(this.keys.up)) {
      this.setGravity('up');
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.down)) {
      this.setGravity('down');
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.left)) {
      this.setGravity('left');
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.right)) {
      this.setGravity('right');
    }
  }

  setGravity(direction) {
    const gravityStrength = 200;
    
    switch (direction) {
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

    this.gravityDirection = direction;
    this.switchCount++;
    this.updateInfoText();
  }

  updateInfoText() {
    const directionSymbols = {
      up: '↑',
      down: '↓',
      left: '←',
      right: '→'
    };

    this.infoText.setText([
      `Gravity: ${directionSymbols[this.gravityDirection]} ${this.gravityDirection.toUpperCase()}`,
      `Switches: ${this.switchCount}`,
      `Press Arrow Keys to change gravity`,
      `Objects: ${this.objects.getChildren().length + 1} (1 player + 8 objects)`
    ]);
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
      gravity: { y: 200 }, // 初始重力向下
      debug: false
    }
  },
  scene: GravitySwitchScene
};

new Phaser.Game(config);
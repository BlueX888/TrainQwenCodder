class GravitySwitchScene extends Phaser.Scene {
  constructor() {
    super('GravitySwitchScene');
    this.gravitySwitchCount = 0; // 状态信号：重力切换次数
    this.currentGravityDirection = 'down'; // 状态信号：当前重力方向
    this.gravityMagnitude = 800;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
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

    // 创建地面纹理（灰色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x666666, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建边界（四周）
    const ground = this.physics.add.staticGroup();
    ground.create(400, 575, 'ground'); // 底部
    
    const topGround = this.add.graphics();
    topGround.fillStyle(0x666666, 1);
    topGround.fillRect(0, 0, 800, 50);
    topGround.generateTexture('topGround', 800, 50);
    topGround.destroy();
    ground.create(400, 25, 'topGround'); // 顶部

    const sideGround = this.add.graphics();
    sideGround.fillStyle(0x666666, 1);
    sideGround.fillRect(0, 0, 50, 600);
    sideGround.generateTexture('sideGround', 50, 600);
    sideGround.destroy();
    ground.create(25, 300, 'sideGround'); // 左侧
    ground.create(775, 300, 'sideGround'); // 右侧

    // 创建玩家（中心位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 使用自定义边界
    this.player.setBounce(0.3);

    // 创建 5 个物体（使用固定种子确保确定性）
    this.objects = this.physics.add.group();
    const positions = [
      { x: 150, y: 150 },
      { x: 650, y: 150 },
      { x: 200, y: 400 },
      { x: 600, y: 400 },
      { x: 400, y: 200 }
    ];

    positions.forEach(pos => {
      const obj = this.objects.create(pos.x, pos.y, 'object');
      obj.setBounce(0.4);
      obj.setCollideWorldBounds(false);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.objects, ground);
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建 UI 显示
    this.gravityText = this.add.text(10, 10, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateGravityDisplay();

    // 添加键盘事件监听（避免重复触发）
    this.input.keyboard.on('keydown-UP', () => this.switchGravity('up'));
    this.input.keyboard.on('keydown-DOWN', () => this.switchGravity('down'));
    this.input.keyboard.on('keydown-LEFT', () => this.switchGravity('left'));
    this.input.keyboard.on('keydown-RIGHT', () => this.switchGravity('right'));
  }

  switchGravity(direction) {
    // 避免重复切换到相同方向
    if (this.currentGravityDirection === direction) {
      return;
    }

    this.currentGravityDirection = direction;
    this.gravitySwitchCount++;

    const gravity = this.gravityMagnitude;

    switch (direction) {
      case 'up':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = -gravity;
        break;
      case 'down':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = gravity;
        break;
      case 'left':
        this.physics.world.gravity.x = -gravity;
        this.physics.world.gravity.y = 0;
        break;
      case 'right':
        this.physics.world.gravity.x = gravity;
        this.physics.world.gravity.y = 0;
        break;
    }

    this.updateGravityDisplay();
  }

  updateGravityDisplay() {
    const directionSymbols = {
      'up': '↑',
      'down': '↓',
      'left': '←',
      'right': '→'
    };

    this.gravityText.setText(
      `Gravity: ${directionSymbols[this.currentGravityDirection]} ${this.currentGravityDirection.toUpperCase()}\n` +
      `Switches: ${this.gravitySwitchCount}\n` +
      `Press Arrow Keys to Switch`
    );
  }

  update(time, delta) {
    // 确保所有物体在边界内（简单的边界检查）
    const checkBounds = (sprite) => {
      if (sprite.x < 50) sprite.x = 50;
      if (sprite.x > 750) sprite.x = 750;
      if (sprite.y < 50) sprite.y = 50;
      if (sprite.y > 550) sprite.y = 550;
    };

    checkBounds(this.player);
    this.objects.children.entries.forEach(obj => checkBounds(obj));
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
      gravity: { y: 800 }, // 初始重力向下
      debug: false
    }
  },
  scene: GravitySwitchScene
};

new Phaser.Game(config);
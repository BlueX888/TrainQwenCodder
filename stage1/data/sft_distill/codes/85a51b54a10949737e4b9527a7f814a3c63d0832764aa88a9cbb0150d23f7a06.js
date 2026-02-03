class GravityGameScene extends Phaser.Scene {
  constructor() {
    super('GravityGameScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.switchCount = 0; // 状态信号：重力切换次数
    this.gravityMagnitude = 600;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建物体纹理（红色圆形）
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xff4444, 1);
    objectGraphics.fillCircle(16, 16, 16);
    objectGraphics.generateTexture('object', 32, 32);
    objectGraphics.destroy();

    // 创建边界纹理（灰色）
    const boundaryGraphics = this.add.graphics();
    boundaryGraphics.fillStyle(0x666666, 1);
    boundaryGraphics.fillRect(0, 0, 800, 20);
    boundaryGraphics.generateTexture('boundary_h', 800, 20);
    boundaryGraphics.destroy();

    const boundaryGraphics2 = this.add.graphics();
    boundaryGraphics2.fillStyle(0x666666, 1);
    boundaryGraphics2.fillRect(0, 0, 20, 600);
    boundaryGraphics2.generateTexture('boundary_v', 20, 600);
    boundaryGraphics2.destroy();

    // 创建边界（静态物理组）
    this.boundaries = this.physics.add.staticGroup();
    this.boundaries.create(400, 10, 'boundary_h'); // 顶部
    this.boundaries.create(400, 590, 'boundary_h'); // 底部
    this.boundaries.create(10, 300, 'boundary_v'); // 左侧
    this.boundaries.create(790, 300, 'boundary_v'); // 右侧

    // 创建玩家（使用固定种子生成位置）
    const playerX = 400;
    const playerY = 300;
    this.player = this.physics.add.sprite(playerX, playerY, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(false);

    // 创建 8 个物体（使用固定位置模式）
    this.objects = this.physics.add.group();
    const positions = [
      { x: 200, y: 150 },
      { x: 600, y: 150 },
      { x: 150, y: 300 },
      { x: 650, y: 300 },
      { x: 200, y: 450 },
      { x: 600, y: 450 },
      { x: 350, y: 200 },
      { x: 450, y: 400 }
    ];

    positions.forEach(pos => {
      const obj = this.objects.create(pos.x, pos.y, 'object');
      obj.setBounce(0.4);
      obj.setCollideWorldBounds(false);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.boundaries);
    this.physics.add.collider(this.objects, this.boundaries);
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加键盘事件监听（切换重力）
    this.input.keyboard.on('keydown-UP', () => this.setGravity('up'));
    this.input.keyboard.on('keydown-DOWN', () => this.setGravity('down'));
    this.input.keyboard.on('keydown-LEFT', () => this.setGravity('left'));
    this.input.keyboard.on('keydown-RIGHT', () => this.setGravity('right'));

    // 显示状态信息
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateInfoText();

    // 初始化重力方向（向下）
    this.setGravity('down');
  }

  setGravity(direction) {
    if (this.gravityDirection === direction) {
      return; // 相同方向不重复切换
    }

    this.gravityDirection = direction;
    this.switchCount++;

    const magnitude = this.gravityMagnitude;

    switch (direction) {
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

    this.updateInfoText();
  }

  updateInfoText() {
    this.infoText.setText([
      `Gravity: ${this.gravityDirection.toUpperCase()}`,
      `Switch Count: ${this.switchCount}`,
      `Use Arrow Keys to change gravity`
    ]);
  }

  update(time, delta) {
    // 检查物体是否超出边界，重置位置
    const bounds = { x: 0, y: 0, width: 800, height: 600 };
    
    if (!Phaser.Geom.Rectangle.Contains(bounds, this.player.x, this.player.y)) {
      this.player.setPosition(400, 300);
      this.player.setVelocity(0, 0);
    }

    this.objects.children.entries.forEach(obj => {
      if (!Phaser.Geom.Rectangle.Contains(bounds, obj.x, obj.y)) {
        obj.setPosition(
          Phaser.Math.Between(100, 700),
          Phaser.Math.Between(100, 500)
        );
        obj.setVelocity(0, 0);
      }
    });
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
      gravity: { x: 0, y: 600 },
      debug: false
    }
  },
  scene: GravityGameScene
};

new Phaser.Game(config);
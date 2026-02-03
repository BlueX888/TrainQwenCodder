class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.objectCount = 10; // 状态信号：物体数量
    this.gravityMagnitude = 300; // 重力大小
  }

  preload() {
    // 使用 Graphics 生成纹理，不依赖外部资源
    this.createTextures();
  }

  createTextures() {
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
    boundaryGraphics.fillRect(0, 0, 10, 10);
    boundaryGraphics.generateTexture('boundary', 10, 10);
    boundaryGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 创建边界视觉提示
    this.createBoundaries();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);
    this.player.body.setAllowGravity(true);

    // 创建物体组
    this.objects = this.physics.add.group();
    
    // 使用固定种子生成物体位置（保证确定性）
    const positions = [
      {x: 150, y: 100}, {x: 650, y: 100},
      {x: 200, y: 250}, {x: 600, y: 250},
      {x: 300, y: 150}, {x: 500, y: 150},
      {x: 250, y: 400}, {x: 550, y: 400},
      {x: 350, y: 500}, {x: 450, y: 500}
    ];

    for (let i = 0; i < this.objectCount; i++) {
      const obj = this.objects.create(positions[i].x, positions[i].y, 'object');
      obj.setCollideWorldBounds(true);
      obj.setBounce(0.5);
      obj.body.setAllowGravity(true);
    }

    // 添加物体间碰撞
    this.physics.add.collider(this.objects, this.objects);
    this.physics.add.collider(this.player, this.objects);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文字
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加重力方向指示器
    this.gravityIndicator = this.add.graphics();

    // 初始化重力方向
    this.updateGravityDirection('down');
    this.updateInfoText();
  }

  createBoundaries() {
    // 创建边界视觉提示（上下左右）
    const thickness = 10;
    const width = 800;
    const height = 600;

    // 上边界
    this.add.tileSprite(width / 2, thickness / 2, width, thickness, 'boundary');
    // 下边界
    this.add.tileSprite(width / 2, height - thickness / 2, width, thickness, 'boundary');
    // 左边界
    this.add.tileSprite(thickness / 2, height / 2, thickness, height, 'boundary');
    // 右边界
    this.add.tileSprite(width - thickness / 2, height / 2, thickness, height, 'boundary');
  }

  updateGravityDirection(direction) {
    this.gravityDirection = direction;
    
    let gravityX = 0;
    let gravityY = 0;

    switch (direction) {
      case 'up':
        gravityY = -this.gravityMagnitude;
        break;
      case 'down':
        gravityY = this.gravityMagnitude;
        break;
      case 'left':
        gravityX = -this.gravityMagnitude;
        break;
      case 'right':
        gravityX = this.gravityMagnitude;
        break;
    }

    // 更新世界重力
    this.physics.world.gravity.x = gravityX;
    this.physics.world.gravity.y = gravityY;

    this.updateInfoText();
  }

  updateInfoText() {
    const directionSymbols = {
      'up': '↑',
      'down': '↓',
      'left': '←',
      'right': '→'
    };

    this.infoText.setText([
      `Gravity Direction: ${directionSymbols[this.gravityDirection]} ${this.gravityDirection.toUpperCase()}`,
      `Gravity Magnitude: ${this.gravityMagnitude}`,
      `Objects: ${this.objectCount}`,
      ``,
      `Controls:`,
      `Arrow Keys - Change Gravity Direction`
    ]);

    // 更新重力指示器
    this.drawGravityIndicator();
  }

  drawGravityIndicator() {
    this.gravityIndicator.clear();
    this.gravityIndicator.fillStyle(0xffff00, 0.8);

    const centerX = 400;
    const centerY = 300;
    const arrowLength = 60;

    // 根据重力方向绘制箭头
    switch (this.gravityDirection) {
      case 'up':
        this.gravityIndicator.fillTriangle(
          centerX, centerY - arrowLength,
          centerX - 15, centerY - arrowLength + 30,
          centerX + 15, centerY - arrowLength + 30
        );
        break;
      case 'down':
        this.gravityIndicator.fillTriangle(
          centerX, centerY + arrowLength,
          centerX - 15, centerY + arrowLength - 30,
          centerX + 15, centerY + arrowLength - 30
        );
        break;
      case 'left':
        this.gravityIndicator.fillTriangle(
          centerX - arrowLength, centerY,
          centerX - arrowLength + 30, centerY - 15,
          centerX - arrowLength + 30, centerY + 15
        );
        break;
      case 'right':
        this.gravityIndicator.fillTriangle(
          centerX + arrowLength, centerY,
          centerX + arrowLength - 30, centerY - 15,
          centerX + arrowLength - 30, centerY + 15
        );
        break;
    }
  }

  update(time, delta) {
    // 检测方向键按下（使用 justDown 避免连续触发）
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.updateGravityDirection('up');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.updateGravityDirection('down');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.updateGravityDirection('left');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.updateGravityDirection('right');
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 300 }, // 初始重力向下
      debug: false
    }
  },
  scene: GravityScene
};

// 创建游戏实例
const game = new Phaser.Game(config);
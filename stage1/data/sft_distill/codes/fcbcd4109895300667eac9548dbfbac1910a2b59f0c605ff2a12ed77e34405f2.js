class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.gravitySwitchCount = 0; // 状态信号：重力切换次数
    this.gravityMagnitude = 800; // 重力大小
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

    // 创建边界纹理
    const boundaryGraphics = this.add.graphics();
    boundaryGraphics.lineStyle(4, 0xffffff, 1);
    boundaryGraphics.strokeRect(2, 2, 796, 596);
    boundaryGraphics.generateTexture('boundary', 800, 600);
    boundaryGraphics.destroy();

    // 添加边界背景
    this.add.image(400, 300, 'boundary').setDepth(-1);

    // 创建玩家（绿色圆形）
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);
    this.player.setDamping(true);
    this.player.setDrag(0.95);

    // 创建 5 个物体（橙色方块），使用固定位置确保确定性
    this.objects = this.physics.add.group();
    const positions = [
      { x: 150, y: 150 },
      { x: 650, y: 150 },
      { x: 250, y: 400 },
      { x: 550, y: 400 },
      { x: 400, y: 250 }
    ];

    positions.forEach(pos => {
      const obj = this.objects.create(pos.x, pos.y, 'object');
      obj.setCollideWorldBounds(true);
      obj.setBounce(0.4);
      obj.setDamping(true);
      obj.setDrag(0.95);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 设置初始重力
    this.physics.world.gravity.y = this.gravityMagnitude;

    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setDepth(10);

    // 添加说明文本
    this.add.text(10, 560, '使用方向键切换重力方向', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });

    this.updateStatusText();
  }

  update() {
    // 检测方向键按下事件（使用 JustDown 避免重复触发）
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
    // 重置所有重力方向
    this.physics.world.gravity.x = 0;
    this.physics.world.gravity.y = 0;

    // 根据方向设置重力
    switch (direction) {
      case 'up':
        this.physics.world.gravity.y = -this.gravityMagnitude;
        break;
      case 'down':
        this.physics.world.gravity.y = this.gravityMagnitude;
        break;
      case 'left':
        this.physics.world.gravity.x = -this.gravityMagnitude;
        break;
      case 'right':
        this.physics.world.gravity.x = this.gravityMagnitude;
        break;
    }

    // 更新状态信号
    if (this.gravityDirection !== direction) {
      this.gravityDirection = direction;
      this.gravitySwitchCount++;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    const directionSymbols = {
      'up': '↑',
      'down': '↓',
      'left': '←',
      'right': '→'
    };

    this.statusText.setText([
      `重力方向: ${directionSymbols[this.gravityDirection]} ${this.gravityDirection}`,
      `切换次数: ${this.gravitySwitchCount}`,
      `重力大小: ${this.gravityMagnitude}`
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
      gravity: { x: 0, y: 800 },
      debug: false
    }
  },
  scene: GravityScene
};

new Phaser.Game(config);
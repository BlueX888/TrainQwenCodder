class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.gravitySwitchCount = 0; // 状态信号：重力切换次数
    this.gravityMagnitude = 300; // 重力大小
  }

  preload() {
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
    boundaryGraphics.fillRect(0, 0, 16, 16);
    boundaryGraphics.generateTexture('boundary', 16, 16);
    boundaryGraphics.destroy();
  }

  create() {
    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);

    // 创建边界视觉提示
    this.createBoundaries();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 创建8个物体（使用固定位置确保确定性）
    this.objects = this.physics.add.group();
    const positions = [
      { x: 200, y: 150 },
      { x: 600, y: 150 },
      { x: 150, y: 300 },
      { x: 650, y: 300 },
      { x: 300, y: 450 },
      { x: 500, y: 450 },
      { x: 100, y: 200 },
      { x: 700, y: 400 }
    ];

    positions.forEach(pos => {
      const obj = this.objects.create(pos.x, pos.y, 'object');
      obj.setBounce(0.5);
      obj.setCollideWorldBounds(true);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 560, 'Arrow Keys: Change Gravity Direction', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });

    // 初始化重力
    this.updateGravity('down');
  }

  createBoundaries() {
    // 顶部边界
    for (let i = 0; i < 50; i++) {
      this.add.image(i * 16 + 8, 8, 'boundary').setAlpha(0.5);
    }
    // 底部边界
    for (let i = 0; i < 50; i++) {
      this.add.image(i * 16 + 8, 592, 'boundary').setAlpha(0.5);
    }
    // 左边界
    for (let i = 0; i < 37; i++) {
      this.add.image(8, i * 16 + 8, 'boundary').setAlpha(0.5);
    }
    // 右边界
    for (let i = 0; i < 37; i++) {
      this.add.image(792, i * 16 + 8, 'boundary').setAlpha(0.5);
    }
  }

  update() {
    // 检测方向键按下（使用 justDown 避免重复触发）
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.updateGravity('up');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.updateGravity('down');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.updateGravity('left');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.updateGravity('right');
    }

    // 更新状态显示
    this.statusText.setText([
      `Gravity Direction: ${this.gravityDirection.toUpperCase()}`,
      `Switch Count: ${this.gravitySwitchCount}`,
      `Player Pos: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    ]);
  }

  updateGravity(direction) {
    // 只在方向改变时更新
    if (this.gravityDirection === direction) {
      return;
    }

    this.gravityDirection = direction;
    this.gravitySwitchCount++;

    // 根据方向设置重力
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

    // 视觉反馈：短暂闪烁所有物体
    this.tweens.add({
      targets: [this.player, ...this.objects.getChildren()],
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
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
      gravity: { x: 0, y: 300 },
      debug: false
    }
  },
  scene: GravityScene
};

new Phaser.Game(config);
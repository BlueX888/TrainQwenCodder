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
    // 设置随机种子以保证确定性
    Phaser.Math.RND.sow(['gravity-switch-seed']);

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建物体纹理（红色圆形）
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xff4444, 1);
    objectGraphics.fillCircle(15, 15, 15);
    objectGraphics.generateTexture('object', 30, 30);
    objectGraphics.destroy();

    // 创建边界纹理（灰色）
    const boundGraphics = this.add.graphics();
    boundGraphics.lineStyle(4, 0x666666, 1);
    boundGraphics.strokeRect(2, 2, 796, 596);
    boundGraphics.generateTexture('boundary', 800, 600);
    boundGraphics.destroy();

    // 添加边界背景
    this.add.image(400, 300, 'boundary').setDepth(-1);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 创建10个物体组
    this.objects = this.physics.add.group();
    
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      const obj = this.objects.create(x, y, 'object');
      obj.setBounce(0.5);
      obj.setCollideWorldBounds(true);
      // 添加随机初始速度
      obj.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
    }

    // 物体之间的碰撞
    this.physics.add.collider(this.objects, this.objects);
    this.physics.add.collider(this.player, this.objects);

    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文字
    this.instructionText = this.add.text(10, 10, 
      'Use Arrow Keys to switch gravity direction\nGravity: DOWN | Switches: 0', 
      {
        fontSize: '18px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 10 }
      }
    ).setDepth(100);

    // 添加重力方向指示器
    this.gravityIndicator = this.add.graphics();
    this.updateGravityIndicator();

    // 键盘按下标记（防止重复触发）
    this.keyPressed = {
      up: false,
      down: false,
      left: false,
      right: false
    };
  }

  update() {
    // 检测方向键按下并切换重力
    if (this.cursors.up.isDown && !this.keyPressed.up) {
      this.setGravity(0, -500, 'up');
      this.keyPressed.up = true;
    } else if (this.cursors.up.isUp) {
      this.keyPressed.up = false;
    }

    if (this.cursors.down.isDown && !this.keyPressed.down) {
      this.setGravity(0, 500, 'down');
      this.keyPressed.down = true;
    } else if (this.cursors.down.isUp) {
      this.keyPressed.down = false;
    }

    if (this.cursors.left.isDown && !this.keyPressed.left) {
      this.setGravity(-500, 0, 'left');
      this.keyPressed.left = true;
    } else if (this.cursors.left.isUp) {
      this.keyPressed.left = false;
    }

    if (this.cursors.right.isDown && !this.keyPressed.right) {
      this.setGravity(500, 0, 'right');
      this.keyPressed.right = true;
    } else if (this.cursors.right.isUp) {
      this.keyPressed.right = false;
    }
  }

  setGravity(x, y, direction) {
    // 设置世界重力
    this.physics.world.gravity.x = x;
    this.physics.world.gravity.y = y;

    // 更新状态
    this.gravityDirection = direction;
    this.switchCount++;

    // 更新UI
    this.instructionText.setText(
      `Use Arrow Keys to switch gravity direction\nGravity: ${direction.toUpperCase()} | Switches: ${this.switchCount}`
    );

    // 更新重力指示器
    this.updateGravityIndicator();

    // 输出状态到控制台（用于验证）
    console.log(`Gravity switched to ${direction} (${x}, ${y}) - Total switches: ${this.switchCount}`);
  }

  updateGravityIndicator() {
    this.gravityIndicator.clear();
    this.gravityIndicator.fillStyle(0xffff00, 1);

    const centerX = 750;
    const centerY = 550;
    const size = 30;

    // 根据重力方向绘制箭头
    this.gravityIndicator.beginPath();
    
    switch(this.gravityDirection) {
      case 'up':
        this.gravityIndicator.moveTo(centerX, centerY - size);
        this.gravityIndicator.lineTo(centerX - size/2, centerY);
        this.gravityIndicator.lineTo(centerX + size/2, centerY);
        break;
      case 'down':
        this.gravityIndicator.moveTo(centerX, centerY + size);
        this.gravityIndicator.lineTo(centerX - size/2, centerY);
        this.gravityIndicator.lineTo(centerX + size/2, centerY);
        break;
      case 'left':
        this.gravityIndicator.moveTo(centerX - size, centerY);
        this.gravityIndicator.lineTo(centerX, centerY - size/2);
        this.gravityIndicator.lineTo(centerX, centerY + size/2);
        break;
      case 'right':
        this.gravityIndicator.moveTo(centerX + size, centerY);
        this.gravityIndicator.lineTo(centerX, centerY - size/2);
        this.gravityIndicator.lineTo(centerX, centerY + size/2);
        break;
    }
    
    this.gravityIndicator.closePath();
    this.gravityIndicator.fillPath();
    this.gravityIndicator.setDepth(100);
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
      gravity: { x: 0, y: 500 },
      debug: false
    }
  },
  scene: GravitySwitchScene
};

new Phaser.Game(config);
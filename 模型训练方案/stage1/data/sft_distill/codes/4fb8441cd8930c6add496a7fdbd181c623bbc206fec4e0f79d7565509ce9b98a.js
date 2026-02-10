class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravitySwitchCount = 0; // 状态信号：重力切换次数
    this.currentGravityDirection = 'down'; // 当前重力方向
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建物体纹理（不同颜色的圆形，使用固定种子保证确定性）
    const colors = [0xe74c3c, 0x2ecc71, 0xf39c12, 0x9b59b6, 0x1abc9c];
    colors.forEach((color, index) => {
      const objGraphics = this.make.graphics({ x: 0, y: 0, add: false });
      objGraphics.fillStyle(color, 1);
      objGraphics.fillCircle(15, 15, 15);
      objGraphics.generateTexture(`object${index}`, 30, 30);
      objGraphics.destroy();
    });

    // 创建方向指示器纹理
    const arrowGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    arrowGraphics.fillStyle(0xffff00, 1);
    arrowGraphics.fillTriangle(15, 0, 0, 30, 30, 30);
    arrowGraphics.generateTexture('arrow', 30, 30);
    arrowGraphics.destroy();
  }

  create() {
    const { width, height } = this.scale;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 1);
    bg.fillRect(0, 0, width, height);

    // 创建边界
    this.physics.world.setBounds(0, 0, width, height);
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 初始重力设置（向下）
    this.physics.world.gravity.x = 0;
    this.physics.world.gravity.y = 800;

    // 创建玩家（使用固定位置保证确定性）
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.95);

    // 创建5个物体（固定位置保证确定性）
    this.objects = [];
    const positions = [
      { x: 200, y: 150 },
      { x: 600, y: 150 },
      { x: 300, y: 250 },
      { x: 500, y: 250 },
      { x: 400, y: 350 }
    ];

    positions.forEach((pos, index) => {
      const obj = this.physics.add.sprite(pos.x, pos.y, `object${index}`);
      obj.setBounce(0.4);
      obj.setCollideWorldBounds(true);
      obj.setDamping(true);
      obj.setDrag(0.9);
      this.objects.push(obj);
    });

    // 添加物体之间的碰撞
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 创建重力方向指示器
    this.gravityArrow = this.add.sprite(width - 50, 50, 'arrow');
    this.gravityArrow.setScrollFactor(0);
    this.gravityArrow.setAngle(180); // 初始向下

    // 创建UI文本
    this.infoText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.infoText.setScrollFactor(0);

    this.instructionText = this.add.text(16, height - 80, 
      'Use Arrow Keys to Switch Gravity Direction\n↑ Up  ↓ Down  ← Left  → Right', {
      fontSize: '16px',
      fill: '#ecf0f1',
      backgroundColor: '#34495e',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setScrollFactor(0);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加键盘事件监听（只在按下时触发一次）
    this.input.keyboard.on('keydown-UP', () => this.switchGravity('up'));
    this.input.keyboard.on('keydown-DOWN', () => this.switchGravity('down'));
    this.input.keyboard.on('keydown-LEFT', () => this.switchGravity('left'));
    this.input.keyboard.on('keydown-RIGHT', () => this.switchGravity('right'));

    // 更新UI
    this.updateUI();
  }

  switchGravity(direction) {
    // 如果方向相同，不切换
    if (this.currentGravityDirection === direction) {
      return;
    }

    const GRAVITY_STRENGTH = 800;
    this.currentGravityDirection = direction;
    this.gravitySwitchCount++;

    // 根据方向设置重力
    switch (direction) {
      case 'up':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = -GRAVITY_STRENGTH;
        this.gravityArrow.setAngle(0);
        break;
      case 'down':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = GRAVITY_STRENGTH;
        this.gravityArrow.setAngle(180);
        break;
      case 'left':
        this.physics.world.gravity.x = -GRAVITY_STRENGTH;
        this.physics.world.gravity.y = 0;
        this.gravityArrow.setAngle(270);
        break;
      case 'right':
        this.physics.world.gravity.x = GRAVITY_STRENGTH;
        this.physics.world.gravity.y = 0;
        this.gravityArrow.setAngle(90);
        break;
    }

    // 更新UI
    this.updateUI();

    // 视觉反馈：箭头闪烁
    this.tweens.add({
      targets: this.gravityArrow,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1
    });
  }

  updateUI() {
    const directionNames = {
      'up': 'UP ↑',
      'down': 'DOWN ↓',
      'left': 'LEFT ←',
      'right': 'RIGHT →'
    };

    this.infoText.setText([
      `Gravity Switches: ${this.gravitySwitchCount}`,
      `Current Direction: ${directionNames[this.currentGravityDirection]}`,
      `Gravity: (${this.physics.world.gravity.x}, ${this.physics.world.gravity.y})`
    ]);
  }

  update(time, delta) {
    // 持续更新UI（显示物体状态）
    if (time % 100 < delta) {
      this.updateUI();
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: GravityScene,
  seed: [(Date.now() * Math.random()).toString()] // 可配置随机种子
};

// 创建游戏实例
new Phaser.Game(config);
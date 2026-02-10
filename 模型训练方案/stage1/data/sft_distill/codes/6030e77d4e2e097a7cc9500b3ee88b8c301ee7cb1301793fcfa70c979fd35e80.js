class MiniMapScene extends Phaser.Scene {
  constructor() {
    super('MiniMapScene');
    this.playerX = 0;
    this.playerY = 0;
    this.worldWidth = 2000;
    this.worldHeight = 1500;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 设置世界边界
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // 创建背景网格
    this.createBackground();

    // 创建障碍物作为参照物
    this.createObstacles();

    // 创建玩家
    this.createPlayer();

    // 设置主相机
    this.setupMainCamera();

    // 创建小地图相机
    this.setupMiniMapCamera();

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.createStatusText();
  }

  createBackground() {
    const graphics = this.add.graphics();
    
    // 绘制背景
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, this.worldWidth, this.worldHeight);

    // 绘制网格
    graphics.lineStyle(1, 0x2a2a3e, 0.5);
    for (let x = 0; x <= this.worldWidth; x += 100) {
      graphics.lineBetween(x, 0, x, this.worldHeight);
    }
    for (let y = 0; y <= this.worldHeight; y += 100) {
      graphics.lineBetween(0, y, this.worldWidth, y);
    }
  }

  createObstacles() {
    this.obstacles = this.add.group();
    
    // 使用固定种子创建障碍物
    const positions = [
      { x: 300, y: 300, color: 0xff6b6b },
      { x: 800, y: 400, color: 0x4ecdc4 },
      { x: 1200, y: 600, color: 0xffe66d },
      { x: 500, y: 900, color: 0x95e1d3 },
      { x: 1500, y: 800, color: 0xf38181 },
      { x: 1700, y: 300, color: 0xaa96da },
      { x: 400, y: 1200, color: 0xfcbad3 },
      { x: 1000, y: 1100, color: 0xa8e6cf },
      { x: 1600, y: 1200, color: 0xffd3b6 },
      { x: 200, y: 700, color: 0xffaaa5 }
    ];

    positions.forEach(pos => {
      const graphics = this.add.graphics();
      graphics.fillStyle(pos.color, 1);
      graphics.fillRect(0, 0, 80, 80);
      graphics.generateTexture('obstacle_' + pos.x, 80, 80);
      graphics.destroy();

      const obstacle = this.physics.add.sprite(pos.x, pos.y, 'obstacle_' + pos.x);
      obstacle.setImmovable(true);
      this.obstacles.add(obstacle);
    });
  }

  createPlayer() {
    // 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(
      this.worldWidth / 2,
      this.worldHeight / 2,
      'player'
    );
    
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(240, 240);
    this.player.setDrag(800, 800);

    // 添加碰撞
    this.physics.add.collider(this.player, this.obstacles);
  }

  setupMainCamera() {
    // 主相机跟随玩家
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
  }

  setupMiniMapCamera() {
    // 创建小地图相机
    const miniMapWidth = 200;
    const miniMapHeight = 150;
    const padding = 10;

    this.miniMapCamera = this.cameras.add(
      this.cameras.main.width - miniMapWidth - padding,
      padding,
      miniMapWidth,
      miniMapHeight
    );

    // 设置小地图显示整个世界
    this.miniMapCamera.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.miniMapCamera.setZoom(miniMapWidth / this.worldWidth);
    this.miniMapCamera.setBackgroundColor(0x000000);

    // 创建小地图边框
    this.createMiniMapBorder(
      this.cameras.main.width - miniMapWidth - padding,
      padding,
      miniMapWidth,
      miniMapHeight
    );
  }

  createMiniMapBorder(x, y, width, height) {
    // 边框需要固定在屏幕上，不随相机移动
    const border = this.add.graphics();
    border.lineStyle(3, 0xffffff, 1);
    border.strokeRect(x - 2, y - 2, width + 4, height + 4);
    border.setScrollFactor(0); // 固定在屏幕上
    border.setDepth(1000);
  }

  createStatusText() {
    // 创建状态文本（固定在屏幕上）
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0);
    this.statusText.setDepth(1000);
  }

  update(time, delta) {
    // 重置速度
    this.player.setAcceleration(0);

    // 键盘控制
    const acceleration = 800;
    
    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-acceleration);
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(acceleration);
    }

    if (this.cursors.up.isDown) {
      this.player.setAccelerationY(-acceleration);
    } else if (this.cursors.down.isDown) {
      this.player.setAccelerationY(acceleration);
    }

    // 限制最大速度
    const maxSpeed = 240;
    if (this.player.body.velocity.length() > maxSpeed) {
      this.player.body.velocity.normalize().scale(maxSpeed);
    }

    // 更新状态变量
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);

    // 更新状态文本
    this.statusText.setText([
      `Position: (${this.playerX}, ${this.playerY})`,
      `Speed: ${Math.round(this.player.body.velocity.length())}`,
      `Use Arrow Keys to Move`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: MiniMapScene
};

new Phaser.Game(config);
class MiniMapScene extends Phaser.Scene {
  constructor() {
    super('MiniMapScene');
    this.playerX = 0;
    this.playerY = 0;
    this.totalDistance = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置世界边界
    const worldWidth = 2000;
    const worldHeight = 1500;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // 绘制游戏世界背景
    this.createWorldBackground(worldWidth, worldHeight);

    // 创建玩家
    this.player = this.createPlayer(400, 300);

    // 创建小地图相机指示器（在世界中绘制，小地图会显示）
    this.createMiniMapIndicator();

    // 设置主相机
    this.setupMainCamera(worldWidth, worldHeight);

    // 添加小地图相机
    this.setupMiniMapCamera(worldWidth, worldHeight);

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.createStatusText();

    // 记录上一帧位置用于计算移动距离
    this.lastPlayerX = this.player.x;
    this.lastPlayerY = this.player.y;
  }

  createWorldBackground(width, height) {
    const graphics = this.add.graphics();

    // 绘制草地背景（绿色网格）
    graphics.fillStyle(0x90EE90, 1);
    graphics.fillRect(0, 0, width, height);

    // 绘制网格线
    graphics.lineStyle(1, 0x228B22, 0.3);
    const gridSize = 100;
    
    for (let x = 0; x <= width; x += gridSize) {
      graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      graphics.lineBetween(0, y, width, y);
    }

    // 绘制边界
    graphics.lineStyle(4, 0x8B4513, 1);
    graphics.strokeRect(0, 0, width, height);

    // 添加一些装饰物（树木）
    const treePositions = [
      [300, 400], [800, 200], [1500, 600], [1200, 1000],
      [600, 1200], [1700, 300], [400, 800], [1000, 500]
    ];

    treePositions.forEach(([x, y]) => {
      // 树干
      graphics.fillStyle(0x8B4513, 1);
      graphics.fillCircle(x, y, 15);
      
      // 树冠
      graphics.fillStyle(0x228B22, 1);
      graphics.fillCircle(x, y - 10, 25);
    });
  }

  createPlayer(x, y) {
    // 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000FF, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.lineStyle(2, 0xFFFFFF, 1);
    graphics.strokeCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵
    const player = this.physics.add.sprite(x, y, 'player');
    player.setCollideWorldBounds(true);
    player.setDamping(true);
    player.setDrag(0.8);
    player.setMaxVelocity(360);

    return player;
  }

  createMiniMapIndicator() {
    // 创建一个跟随玩家的指示器图形（用于小地图显示）
    this.playerIndicator = this.add.graphics();
    this.playerIndicator.setDepth(1000);
  }

  setupMainCamera(worldWidth, worldHeight) {
    // 主相机设置
    const mainCamera = this.cameras.main;
    mainCamera.setBounds(0, 0, worldWidth, worldHeight);
    mainCamera.startFollow(this.player, true, 0.1, 0.1);
    mainCamera.setZoom(1);
  }

  setupMiniMapCamera(worldWidth, worldHeight) {
    // 小地图相机尺寸和位置
    const miniMapWidth = 200;
    const miniMapHeight = 150;
    const padding = 10;
    const miniMapX = this.cameras.main.width - miniMapWidth - padding;
    const miniMapY = padding;

    // 添加小地图相机
    this.miniMapCamera = this.cameras.add(
      miniMapX,
      miniMapY,
      miniMapWidth,
      miniMapHeight
    );

    // 设置小地图相机属性
    this.miniMapCamera.setBounds(0, 0, worldWidth, worldHeight);
    this.miniMapCamera.setZoom(0.1); // 缩小到原来的1/10
    this.miniMapCamera.centerOn(worldWidth / 2, worldHeight / 2);
    this.miniMapCamera.setBackgroundColor(0x000000);

    // 绘制小地图边框
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(3, 0xFFFFFF, 1);
    borderGraphics.strokeRect(miniMapX - 2, miniMapY - 2, miniMapWidth + 4, miniMapHeight + 4);
    borderGraphics.setScrollFactor(0);
    borderGraphics.setDepth(2000);

    // 确保边框不被小地图相机渲染
    this.miniMapCamera.ignore(borderGraphics);
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

    // 小地图不渲染状态文本
    this.miniMapCamera.ignore(this.statusText);
  }

  update(time, delta) {
    // 处理玩家移动
    this.handlePlayerMovement();

    // 更新小地图上的玩家指示器
    this.updateMiniMapIndicator();

    // 计算移动距离
    const dx = this.player.x - this.lastPlayerX;
    const dy = this.player.y - this.lastPlayerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    this.totalDistance += distance;

    this.lastPlayerX = this.player.x;
    this.lastPlayerY = this.player.y;

    // 更新状态信息
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);

    this.statusText.setText([
      `Position: (${this.playerX}, ${this.playerY})`,
      `Distance: ${Math.round(this.totalDistance)}`,
      `Velocity: ${Math.round(this.player.body.velocity.length())}`,
      'Use Arrow Keys to Move'
    ]);
  }

  handlePlayerMovement() {
    const speed = 360;
    const acceleration = 600;

    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-acceleration);
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(acceleration);
    } else {
      this.player.setAccelerationX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setAccelerationY(-acceleration);
    } else if (this.cursors.down.isDown) {
      this.player.setAccelerationY(acceleration);
    } else {
      this.player.setAccelerationY(0);
    }

    // 限制最大速度
    const velocity = this.player.body.velocity;
    const currentSpeed = velocity.length();
    if (currentSpeed > speed) {
      velocity.normalize().scale(speed);
    }
  }

  updateMiniMapIndicator() {
    // 清除之前的绘制
    this.playerIndicator.clear();

    // 在玩家位置绘制指示器（红色圆点）
    this.playerIndicator.fillStyle(0xFF0000, 1);
    this.playerIndicator.fillCircle(this.player.x, this.player.y, 20);
    
    // 绘制方向指示
    this.playerIndicator.lineStyle(4, 0xFFFF00, 1);
    const angle = Math.atan2(this.player.body.velocity.y, this.player.body.velocity.x);
    const length = 30;
    this.playerIndicator.lineBetween(
      this.player.x,
      this.player.y,
      this.player.x + Math.cos(angle) * length,
      this.player.y + Math.sin(angle) * length
    );
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: MiniMapScene
};

new Phaser.Game(config);
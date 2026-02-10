class MiniMapScene extends Phaser.Scene {
  constructor() {
    super('MiniMapScene');
    this.playerSpeed = 200;
    this.worldWidth = 1600;
    this.worldHeight = 1200;
    // 状态信号
    this.playerX = 0;
    this.playerY = 0;
    this.velocity = { x: 0, y: 0 };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置世界边界
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // 创建地图背景
    this.createWorldBackground();

    // 创建一些地图标记物（用于验证小地图效果）
    this.createMapMarkers();

    // 创建玩家
    this.createPlayer();

    // 设置主相机跟随玩家
    this.setupMainCamera();

    // 创建小地图相机
    this.setupMiniMapCamera();

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示状态
    this.createStatusText();
  }

  createWorldBackground() {
    const graphics = this.add.graphics();

    // 绘制棋盘格背景
    const tileSize = 100;
    for (let y = 0; y < this.worldHeight; y += tileSize) {
      for (let x = 0; x < this.worldWidth; x += tileSize) {
        const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
        graphics.fillStyle(isEven ? 0x2d5016 : 0x3a6b1f, 1);
        graphics.fillRect(x, y, tileSize, tileSize);
      }
    }

    // 绘制世界边界
    graphics.lineStyle(4, 0xff0000, 1);
    graphics.strokeRect(2, 2, this.worldWidth - 4, this.worldHeight - 4);
  }

  createMapMarkers() {
    // 创建一些标记物（敌人）
    const enemyPositions = [
      { x: 300, y: 300 },
      { x: 800, y: 400 },
      { x: 1200, y: 600 },
      { x: 400, y: 900 },
      { x: 1400, y: 200 },
      { x: 1000, y: 1000 }
    ];

    enemyPositions.forEach(pos => {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xff0000, 1);
      graphics.fillCircle(pos.x, pos.y, 20);
      
      // 添加边框
      graphics.lineStyle(2, 0x990000, 1);
      graphics.strokeCircle(pos.x, pos.y, 20);
    });

    // 创建一些道具标记
    const itemPositions = [
      { x: 600, y: 200 },
      { x: 1300, y: 800 },
      { x: 200, y: 700 },
      { x: 900, y: 900 }
    ];

    itemPositions.forEach(pos => {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xffff00, 1);
      graphics.fillRect(pos.x - 15, pos.y - 15, 30, 30);
      
      graphics.lineStyle(2, 0xcccc00, 1);
      graphics.strokeRect(pos.x - 15, pos.y - 15, 30, 30);
    });
  }

  createPlayer() {
    // 使用 Graphics 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.lineStyle(3, 0x00cc00, 1);
    graphics.strokeCircle(16, 16, 16);
    
    // 添加方向指示
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 8, 4);
    
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵，位置在世界中心
    this.player = this.physics.add.sprite(
      this.worldWidth / 2,
      this.worldHeight / 2,
      'player'
    );

    // 设置物理属性
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(500);
    this.player.setMaxVelocity(this.playerSpeed);
  }

  setupMainCamera() {
    // 主相机跟随玩家
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setZoom(1);
  }

  setupMiniMapCamera() {
    // 创建小地图相机
    const miniMapWidth = 200;
    const miniMapHeight = 150;
    const padding = 10;

    // 添加小地图相机
    this.miniMapCamera = this.cameras.add(
      800 - miniMapWidth - padding,  // x: 右上角
      padding,                        // y: 顶部
      miniMapWidth,                   // width
      miniMapHeight                   // height
    );

    // 设置小地图相机显示整个世界
    this.miniMapCamera.setBounds(0, 0, this.worldWidth, this.worldHeight);
    
    // 计算缩放比例以显示整个世界
    const zoomX = miniMapWidth / this.worldWidth;
    const zoomY = miniMapHeight / this.worldHeight;
    const zoom = Math.min(zoomX, zoomY);
    this.miniMapCamera.setZoom(zoom);

    // 设置小地图背景色和边框
    this.miniMapCamera.setBackgroundColor(0x000000);

    // 使用 Graphics 绘制小地图边框（固定在主相机视图）
    this.miniMapBorder = this.add.graphics();
    this.miniMapBorder.setScrollFactor(0); // 固定在屏幕上
    this.miniMapBorder.lineStyle(3, 0xffffff, 1);
    this.miniMapBorder.strokeRect(
      800 - miniMapWidth - padding - 2,
      padding - 2,
      miniMapWidth + 4,
      miniMapHeight + 4
    );

    // 添加小地图标签
    this.miniMapLabel = this.add.text(
      800 - miniMapWidth - padding,
      padding - 20,
      'MINI MAP',
      {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 }
      }
    );
    this.miniMapLabel.setScrollFactor(0);
  }

  createStatusText() {
    // 创建状态显示文本（固定在主相机视图）
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    this.statusText.setScrollFactor(0);
    this.statusText.setDepth(1000);
  }

  update(time, delta) {
    // 处理玩家移动
    this.handlePlayerMovement();

    // 更新状态信号
    this.updateStatus();

    // 更新状态显示
    this.updateStatusDisplay();
  }

  handlePlayerMovement() {
    const acceleration = this.playerSpeed * 3;

    // 重置加速度
    this.player.setAcceleration(0);

    // 键盘控制
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
  }

  updateStatus() {
    // 更新状态信号
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);
    this.velocity.x = Math.round(this.player.body.velocity.x);
    this.velocity.y = Math.round(this.player.body.velocity.y);
  }

  updateStatusDisplay() {
    const speed = Math.round(
      Math.sqrt(
        this.velocity.x * this.velocity.x + 
        this.velocity.y * this.velocity.y
      )
    );

    this.statusText.setText([
      'Use Arrow Keys to Move',
      `Position: (${this.playerX}, ${this.playerY})`,
      `Velocity: (${this.velocity.x}, ${this.velocity.y})`,
      `Speed: ${speed}`,
      `Camera: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})`
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
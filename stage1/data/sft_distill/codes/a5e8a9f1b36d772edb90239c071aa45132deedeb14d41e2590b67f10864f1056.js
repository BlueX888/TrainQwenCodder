class MiniMapScene extends Phaser.Scene {
  constructor() {
    super('MiniMapScene');
    this.playerSpeed = 160;
    this.mapWidth = 1600;
    this.mapHeight = 1200;
    // 可验证状态
    this.playerX = 0;
    this.playerY = 0;
    this.miniMapVisible = true;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建地图背景和障碍物
    this.createMap();
    
    // 创建玩家
    this.createPlayer();
    
    // 配置主相机
    this.setupMainCamera();
    
    // 创建小地图相机
    this.setupMiniMapCamera();
    
    // 设置键盘控制
    this.setupControls();
    
    // 添加调试信息
    this.createDebugText();
  }

  createMap() {
    const graphics = this.add.graphics();
    
    // 绘制地图背景（草地）
    graphics.fillStyle(0x228B22, 1);
    graphics.fillRect(0, 0, this.mapWidth, this.mapHeight);
    
    // 绘制一些随机障碍物（树木/岩石）
    const seed = 12345;
    let random = seed;
    const seededRandom = () => {
      random = (random * 9301 + 49297) % 233280;
      return random / 233280;
    };
    
    for (let i = 0; i < 20; i++) {
      const x = seededRandom() * (this.mapWidth - 100) + 50;
      const y = seededRandom() * (this.mapHeight - 100) + 50;
      const size = seededRandom() * 40 + 30;
      const color = seededRandom() > 0.5 ? 0x8B4513 : 0x696969;
      
      graphics.fillStyle(color, 1);
      graphics.fillCircle(x, y, size);
    }
    
    // 绘制地图边界
    graphics.lineStyle(4, 0x000000, 1);
    graphics.strokeRect(0, 0, this.mapWidth, this.mapHeight);
    
    // 绘制网格线（帮助定位）
    graphics.lineStyle(1, 0xFFFFFF, 0.2);
    for (let x = 0; x < this.mapWidth; x += 200) {
      graphics.lineBetween(x, 0, x, this.mapHeight);
    }
    for (let y = 0; y < this.mapHeight; y += 200) {
      graphics.lineBetween(0, y, this.mapWidth, y);
    }
  }

  createPlayer() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0xFF0000, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.lineStyle(2, 0xFFFFFF, 1);
    playerGraphics.strokeCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
    
    // 创建玩家精灵（起始位置在地图中心）
    this.player = this.physics.add.sprite(
      this.mapWidth / 2,
      this.mapHeight / 2,
      'player'
    );
    
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    
    // 设置物理世界边界
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
  }

  setupMainCamera() {
    const mainCamera = this.cameras.main;
    
    // 设置相机边界为地图大小
    mainCamera.setBounds(0, 0, this.mapWidth, this.mapHeight);
    
    // 相机跟随玩家
    mainCamera.startFollow(this.player, true, 0.1, 0.1);
    
    // 设置相机视口为全屏
    mainCamera.setViewport(0, 0, 800, 600);
  }

  setupMiniMapCamera() {
    const miniMapWidth = 200;
    const miniMapHeight = 150;
    const padding = 10;
    
    // 创建小地图相机
    this.miniMapCamera = this.cameras.add(
      800 - miniMapWidth - padding,  // x: 右上角
      padding,                        // y: 顶部
      miniMapWidth,                   // width
      miniMapHeight                   // height
    );
    
    // 设置小地图相机的缩放以显示整个地图
    const zoomX = miniMapWidth / this.mapWidth;
    const zoomY = miniMapHeight / this.mapHeight;
    const zoom = Math.min(zoomX, zoomY);
    this.miniMapCamera.setZoom(zoom);
    
    // 设置小地图相机边界
    this.miniMapCamera.setBounds(0, 0, this.mapWidth, this.mapHeight);
    
    // 小地图相机不跟随，显示整个场景
    this.miniMapCamera.scrollX = (this.mapWidth - miniMapWidth / zoom) / 2;
    this.miniMapCamera.scrollY = (this.mapHeight - miniMapHeight / zoom) / 2;
    
    // 创建小地图边框
    this.createMiniMapBorder(miniMapWidth, miniMapHeight, padding);
    
    // 创建玩家在小地图上的指示器
    this.createPlayerIndicator();
  }

  createMiniMapBorder(width, height, padding) {
    const borderGraphics = this.add.graphics();
    borderGraphics.setScrollFactor(0);
    borderGraphics.setDepth(100);
    
    const x = 800 - width - padding;
    const y = padding;
    
    // 绘制半透明背景
    borderGraphics.fillStyle(0x000000, 0.5);
    borderGraphics.fillRect(x - 2, y - 2, width + 4, height + 4);
    
    // 绘制边框
    borderGraphics.lineStyle(3, 0xFFFFFF, 1);
    borderGraphics.strokeRect(x - 2, y - 2, width + 4, height + 4);
    
    // 添加标题
    this.add.text(x, y - 25, 'Mini Map', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(100);
  }

  createPlayerIndicator() {
    // 在小地图上创建玩家位置指示器
    const indicatorGraphics = this.add.graphics();
    indicatorGraphics.fillStyle(0xFFFF00, 1);
    indicatorGraphics.fillCircle(0, 0, 8);
    indicatorGraphics.lineStyle(2, 0xFF0000, 1);
    indicatorGraphics.strokeCircle(0, 0, 8);
    indicatorGraphics.generateTexture('playerIndicator', 16, 16);
    indicatorGraphics.destroy();
    
    this.playerIndicator = this.add.sprite(0, 0, 'playerIndicator');
    this.playerIndicator.setDepth(20);
  }

  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加 WASD 控制
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  createDebugText() {
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.debugText.setScrollFactor(0);
    this.debugText.setDepth(100);
  }

  update(time, delta) {
    // 重置玩家速度
    this.player.setVelocity(0);
    
    // 处理键盘输入
    let velocityX = 0;
    let velocityY = 0;
    
    if (this.cursors.left.isDown || this.keys.a.isDown) {
      velocityX = -this.playerSpeed;
    } else if (this.cursors.right.isDown || this.keys.d.isDown) {
      velocityX = this.playerSpeed;
    }
    
    if (this.cursors.up.isDown || this.keys.w.isDown) {
      velocityY = -this.playerSpeed;
    } else if (this.cursors.down.isDown || this.keys.s.isDown) {
      velocityY = this.playerSpeed;
    }
    
    // 对角线移动时归一化速度
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }
    
    this.player.setVelocity(velocityX, velocityY);
    
    // 更新玩家位置状态（可验证）
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);
    
    // 更新小地图上的玩家指示器位置
    this.playerIndicator.setPosition(this.player.x, this.player.y);
    
    // 更新调试信息
    this.debugText.setText([
      `Player Position: (${this.playerX}, ${this.playerY})`,
      `Player Speed: ${this.playerSpeed}`,
      `Mini Map: ${this.miniMapVisible ? 'Visible' : 'Hidden'}`,
      `Use Arrow Keys or WASD to move`
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
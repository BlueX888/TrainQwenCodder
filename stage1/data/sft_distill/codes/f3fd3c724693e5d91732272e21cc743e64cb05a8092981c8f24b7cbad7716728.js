class MinimapScene extends Phaser.Scene {
  constructor() {
    super('MinimapScene');
    this.playerX = 0;
    this.playerY = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 设置世界边界（大于屏幕尺寸）
    const worldWidth = 1600;
    const worldHeight = 1200;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // 绘制背景网格
    this.createBackground(worldWidth, worldHeight);

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(worldWidth / 2, worldHeight / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(360, 360);

    // 在地图上添加一些标记物
    this.createLandmarks(worldWidth, worldHeight);

    // 配置主相机（默认相机）
    const mainCamera = this.cameras.main;
    mainCamera.setBounds(0, 0, worldWidth, worldHeight);
    mainCamera.startFollow(this.player, true, 0.1, 0.1);
    mainCamera.setZoom(1);

    // 创建小地图相机
    this.createMinimap(worldWidth, worldHeight);

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示玩家坐标（状态信号）
    this.coordsText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.coordsText.setScrollFactor(0); // 固定在屏幕上
    this.coordsText.setDepth(1000);
  }

  createBackground(worldWidth, worldHeight) {
    const graphics = this.add.graphics();
    
    // 绘制背景
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, worldWidth, worldHeight);

    // 绘制网格
    graphics.lineStyle(1, 0x16213e, 0.5);
    const gridSize = 100;
    
    for (let x = 0; x <= worldWidth; x += gridSize) {
      graphics.lineBetween(x, 0, x, worldHeight);
    }
    
    for (let y = 0; y <= worldHeight; y += gridSize) {
      graphics.lineBetween(0, y, worldWidth, y);
    }

    // 绘制边界
    graphics.lineStyle(4, 0xff0000, 1);
    graphics.strokeRect(2, 2, worldWidth - 4, worldHeight - 4);
  }

  createLandmarks(worldWidth, worldHeight) {
    // 创建一些固定位置的标记物
    const landmarks = [
      { x: 200, y: 200, color: 0xff0000, size: 40 },
      { x: worldWidth - 200, y: 200, color: 0x0000ff, size: 40 },
      { x: 200, y: worldHeight - 200, color: 0xffff00, size: 40 },
      { x: worldWidth - 200, y: worldHeight - 200, color: 0xff00ff, size: 40 },
      { x: worldWidth / 2, y: worldHeight / 2, color: 0x00ffff, size: 60 }
    ];

    landmarks.forEach(landmark => {
      const graphics = this.add.graphics();
      graphics.fillStyle(landmark.color, 0.8);
      graphics.fillRect(
        landmark.x - landmark.size / 2,
        landmark.y - landmark.size / 2,
        landmark.size,
        landmark.size
      );
    });
  }

  createMinimap(worldWidth, worldHeight) {
    // 小地图尺寸
    const minimapWidth = 200;
    const minimapHeight = 150;
    const padding = 10;

    // 创建小地图相机
    this.minimap = this.cameras.add(
      800 - minimapWidth - padding,  // x: 右上角
      padding,                        // y: 顶部
      minimapWidth,                   // width
      minimapHeight                   // height
    );

    // 设置小地图显示整个世界
    this.minimap.setBounds(0, 0, worldWidth, worldHeight);
    this.minimap.setZoom(minimapWidth / worldWidth);
    this.minimap.setBackgroundColor(0x000000);

    // 添加小地图边框
    const border = this.add.graphics();
    border.lineStyle(3, 0xffffff, 1);
    border.strokeRect(
      800 - minimapWidth - padding - 2,
      padding - 2,
      minimapWidth + 4,
      minimapHeight + 4
    );
    border.setScrollFactor(0);
    border.setDepth(999);

    // 小地图忽略边框本身和坐标文本
    this.minimap.ignore([border, this.coordsText]);
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);

    // 键盘控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-360);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(360);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-360);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(360);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      const normalized = this.player.body.velocity.normalize();
      this.player.setVelocity(normalized.x * 360, normalized.y * 360);
    }

    // 更新状态信号
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);

    // 更新坐标显示
    this.coordsText.setText(
      `Player Position: (${this.playerX}, ${this.playerY})\n` +
      `Use Arrow Keys to Move\n` +
      `Main Camera follows player at speed 360`
    );

    // 小地图相机跟随玩家（可选，让小地图也居中显示玩家）
    // 如果想要小地图显示全局，注释掉下面这行
    // this.minimap.centerOn(this.player.x, this.player.y);
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
  scene: MinimapScene
};

const game = new Phaser.Game(config);
class MiniMapScene extends Phaser.Scene {
  constructor() {
    super('MiniMapScene');
    this.playerX = 0;
    this.playerY = 0;
    this.totalDistance = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置世界边界
    const worldWidth = 2000;
    const worldHeight = 1500;
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // 创建地形背景（使用 Graphics 绘制不同颜色的区块）
    this.createTerrain(worldWidth, worldHeight);

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(worldWidth / 2, worldHeight / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(28, 28);

    // 主相机跟随玩家
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);

    // 创建小地图相机
    this.createMiniMap(worldWidth, worldHeight);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.statusText.setScrollFactor(0); // 固定在相机上
    this.statusText.setDepth(1000);

    // 记录上一帧位置用于计算移动距离
    this.lastX = this.player.x;
    this.lastY = this.player.y;
  }

  createTerrain(worldWidth, worldHeight) {
    const graphics = this.add.graphics();
    
    // 绘制背景网格
    const gridSize = 200;
    const colors = [0x3366cc, 0x2d5aa3, 0x264d7a, 0x1f4051];
    
    for (let x = 0; x < worldWidth; x += gridSize) {
      for (let y = 0; y < worldHeight; y += gridSize) {
        const colorIndex = ((x / gridSize) + (y / gridSize)) % colors.length;
        graphics.fillStyle(colors[colorIndex], 1);
        graphics.fillRect(x, y, gridSize, gridSize);
        
        // 绘制边框
        graphics.lineStyle(2, 0x1a1a1a, 0.5);
        graphics.strokeRect(x, y, gridSize, gridSize);
      }
    }

    // 添加一些"建筑物"装饰
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(300, 300, 150, 150);
    graphics.fillRect(1200, 500, 200, 100);
    graphics.fillRect(600, 1000, 100, 200);
    graphics.fillRect(1500, 200, 120, 180);

    // 添加"树木"装饰
    graphics.fillStyle(0x228b22, 1);
    graphics.fillCircle(500, 700, 40);
    graphics.fillCircle(900, 400, 50);
    graphics.fillCircle(1600, 1100, 45);
    graphics.fillCircle(400, 1200, 35);
  }

  createMiniMap(worldWidth, worldHeight) {
    const miniMapWidth = 200;
    const miniMapHeight = 150;
    const padding = 10;

    // 创建小地图相机
    this.miniMapCamera = this.cameras.add(
      this.cameras.main.width - miniMapWidth - padding,
      padding,
      miniMapWidth,
      miniMapHeight
    );

    // 设置小地图相机显示整个世界
    this.miniMapCamera.setBounds(0, 0, worldWidth, worldHeight);
    this.miniMapCamera.setZoom(miniMapWidth / worldWidth);
    this.miniMapCamera.setBackgroundColor(0x000000);

    // 创建小地图边框
    const border = this.add.graphics();
    border.lineStyle(3, 0xffffff, 1);
    border.strokeRect(
      this.cameras.main.width - miniMapWidth - padding - 2,
      padding - 2,
      miniMapWidth + 4,
      miniMapHeight + 4
    );
    border.setScrollFactor(0);
    border.setDepth(999);

    // 创建小地图上的玩家指示器（红点）
    const indicatorGraphics = this.add.graphics();
    indicatorGraphics.fillStyle(0xff0000, 1);
    indicatorGraphics.fillCircle(0, 0, 8);
    indicatorGraphics.lineStyle(2, 0xffffff, 1);
    indicatorGraphics.strokeCircle(0, 0, 8);
    indicatorGraphics.generateTexture('indicator', 16, 16);
    indicatorGraphics.destroy();

    this.playerIndicator = this.add.sprite(0, 0, 'indicator');
    this.playerIndicator.setDepth(1000);

    // 小地图相机只渲染地形，不渲染指示器
    this.miniMapCamera.ignore([this.statusText, border, this.playerIndicator]);
    
    // 主相机忽略小地图边框
    this.cameras.main.ignore([border]);
  }

  update(time, delta) {
    // 玩家移动控制
    const speed = 80;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }

    // 更新小地图相机中心位置（可选：让小地图也跟随玩家）
    // this.miniMapCamera.centerOn(this.player.x, this.player.y);

    // 更新玩家指示器位置（在小地图上显示）
    const miniMapX = this.miniMapCamera.x + (this.player.x / this.physics.world.bounds.width) * this.miniMapCamera.width;
    const miniMapY = this.miniMapCamera.y + (this.player.y / this.physics.world.bounds.height) * this.miniMapCamera.height;
    this.playerIndicator.setPosition(miniMapX, miniMapY);

    // 计算移动距离
    const dx = this.player.x - this.lastX;
    const dy = this.player.y - this.lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    this.totalDistance += distance;

    this.lastX = this.player.x;
    this.lastY = this.player.y;

    // 更新状态信息
    this.playerX = Math.floor(this.player.x);
    this.playerY = Math.floor(this.player.y);

    this.statusText.setText([
      `Position: (${this.playerX}, ${this.playerY})`,
      `Distance: ${Math.floor(this.totalDistance)}`,
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
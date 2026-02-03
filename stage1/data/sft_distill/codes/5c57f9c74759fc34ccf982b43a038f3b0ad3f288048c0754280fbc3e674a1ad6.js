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
    const worldWidth = 2000;
    const worldHeight = 1500;
    
    // 设置世界边界
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // 创建地图背景（使用 Graphics 绘制网格）
    this.createMapBackground(worldWidth, worldHeight);

    // 创建一些地图元素（障碍物/标记点）
    this.createMapElements();

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.lineStyle(2, 0x00aa00, 1);
    playerGraphics.strokeCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(worldWidth / 2, worldHeight / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.9);
    this.player.setMaxVelocity(240, 240);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 主相机设置
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);

    // 创建小地图相机
    this.createMiniMap(worldWidth, worldHeight);

    // 创建 UI 文本显示状态
    this.createUI();

    // 记录上一帧位置用于计算移动距离
    this.lastX = this.player.x;
    this.lastY = this.player.y;
  }

  createMapBackground(width, height) {
    const graphics = this.add.graphics();
    
    // 绘制背景
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, width, height);

    // 绘制网格
    graphics.lineStyle(1, 0x16213e, 0.5);
    const gridSize = 100;
    
    for (let x = 0; x <= width; x += gridSize) {
      graphics.lineBetween(x, 0, x, height);
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      graphics.lineBetween(0, y, width, y);
    }
  }

  createMapElements() {
    const elements = this.add.graphics();
    
    // 使用固定种子生成确定性的地图元素
    const seed = 12345;
    const random = this.createSeededRandom(seed);

    // 创建一些标记点（红色方块）
    elements.fillStyle(0xff0000, 1);
    for (let i = 0; i < 10; i++) {
      const x = random() * 1800 + 100;
      const y = random() * 1300 + 100;
      elements.fillRect(x - 20, y - 20, 40, 40);
    }

    // 创建一些障碍物（蓝色圆形）
    elements.fillStyle(0x0066ff, 1);
    for (let i = 0; i < 8; i++) {
      const x = random() * 1800 + 100;
      const y = random() * 1300 + 100;
      elements.fillCircle(x, y, 30);
    }

    // 创建边界标记（黄色矩形）
    elements.lineStyle(4, 0xffff00, 1);
    elements.strokeRect(10, 10, 1980, 1480);
  }

  createMiniMap(worldWidth, worldHeight) {
    const miniMapWidth = 250;
    const miniMapHeight = 187.5; // 保持比例 2000:1500 = 250:187.5
    const padding = 10;

    // 创建小地图相机
    this.miniMapCamera = this.cameras.add(
      this.cameras.main.width - miniMapWidth - padding,
      padding,
      miniMapWidth,
      miniMapHeight
    );

    // 设置小地图相机属性
    this.miniMapCamera.setBounds(0, 0, worldWidth, worldHeight);
    this.miniMapCamera.setZoom(miniMapWidth / worldWidth);
    this.miniMapCamera.setBackgroundColor(0x000000);

    // 创建小地图边框
    this.miniMapBorder = this.add.graphics();
    this.miniMapBorder.lineStyle(3, 0xffffff, 1);
    this.miniMapBorder.strokeRect(
      this.cameras.main.width - miniMapWidth - padding - 2,
      padding - 2,
      miniMapWidth + 4,
      miniMapHeight + 4
    );
    this.miniMapBorder.setScrollFactor(0);
    this.miniMapBorder.setDepth(1000);

    // 小地图边框不被小地图相机渲染
    this.miniMapCamera.ignore(this.miniMapBorder);
  }

  createUI() {
    // 创建状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0);
    this.statusText.setDepth(1001);

    // UI 文本不被小地图相机渲染
    this.miniMapCamera.ignore(this.statusText);
  }

  createSeededRandom(seed) {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }

  update(time, delta) {
    // 玩家移动控制
    const speed = 240;
    const acceleration = 500;

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

    // 计算移动距离
    const dx = this.player.x - this.lastX;
    const dy = this.player.y - this.lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    this.totalDistance += distance;

    this.lastX = this.player.x;
    this.lastY = this.player.y;

    // 更新状态变量
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);

    // 更新 UI 显示
    this.statusText.setText([
      `Position: (${this.playerX}, ${this.playerY})`,
      `Distance: ${Math.round(this.totalDistance)}`,
      `Speed: ${Math.round(this.player.body.speed)}`,
      '',
      'Use Arrow Keys to Move'
    ]);

    // 更新小地图边框位置（如果主相机大小改变）
    const miniMapWidth = 250;
    const miniMapHeight = 187.5;
    const padding = 10;
    
    this.miniMapBorder.clear();
    this.miniMapBorder.lineStyle(3, 0xffffff, 1);
    this.miniMapBorder.strokeRect(
      this.cameras.main.width - miniMapWidth - padding - 2,
      padding - 2,
      miniMapWidth + 4,
      miniMapHeight + 4
    );
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
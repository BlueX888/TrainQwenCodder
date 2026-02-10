class MinimapScene extends Phaser.Scene {
  constructor() {
    super('MinimapScene');
    this.player = null;
    this.cursors = null;
    this.miniCam = null;
    this.totalDistance = 0; // 状态信号：总移动距离
    this.lastPosition = { x: 0, y: 0 };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 世界边界
    const WORLD_WIDTH = 1600;
    const WORLD_HEIGHT = 1200;
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // 绘制地图背景
    this.createMapBackground(WORLD_WIDTH, WORLD_HEIGHT);

    // 创建地图元素（障碍物、目标点）
    this.createMapElements();

    // 创建玩家
    this.createPlayer();

    // 配置主相机
    this.setupMainCamera(WORLD_WIDTH, WORLD_HEIGHT);

    // 创建小地图相机
    this.createMinimap(WORLD_WIDTH, WORLD_HEIGHT);

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试信息显示
    this.createDebugText();

    // 初始化位置记录
    this.lastPosition = { x: this.player.x, y: this.player.y };
  }

  createMapBackground(width, height) {
    const graphics = this.add.graphics();
    
    // 绘制草地背景（绿色网格）
    graphics.fillStyle(0x2d5016, 1);
    graphics.fillRect(0, 0, width, height);
    
    // 绘制网格线
    graphics.lineStyle(1, 0x3d6026, 0.5);
    for (let x = 0; x < width; x += 100) {
      graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 100) {
      graphics.lineBetween(0, y, width, y);
    }

    // 绘制边界
    graphics.lineStyle(4, 0xff0000, 1);
    graphics.strokeRect(2, 2, width - 4, height - 4);
  }

  createMapElements() {
    // 创建障碍物（树木/岩石）
    const obstacles = [
      { x: 300, y: 300, size: 60, color: 0x8b4513 },
      { x: 800, y: 400, size: 80, color: 0x654321 },
      { x: 1200, y: 600, size: 70, color: 0x8b4513 },
      { x: 500, y: 800, size: 50, color: 0x654321 },
      { x: 1400, y: 300, size: 65, color: 0x8b4513 },
      { x: 200, y: 1000, size: 55, color: 0x654321 }
    ];

    obstacles.forEach(obs => {
      const graphics = this.add.graphics();
      graphics.fillStyle(obs.color, 1);
      graphics.fillCircle(obs.x, obs.y, obs.size);
      
      // 添加阴影效果
      graphics.fillStyle(0x000000, 0.3);
      graphics.fillEllipse(obs.x + 10, obs.y + obs.size - 5, obs.size * 0.8, obs.size * 0.3);
    });

    // 创建目标点（金币）
    const targets = [
      { x: 400, y: 200 },
      { x: 1300, y: 500 },
      { x: 700, y: 900 },
      { x: 1500, y: 1100 }
    ];

    targets.forEach(target => {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xffff00, 1);
      graphics.fillCircle(target.x, target.y, 20);
      graphics.lineStyle(3, 0xffa500, 1);
      graphics.strokeCircle(target.x, target.y, 20);
      
      // 添加闪烁效果
      this.tweens.add({
        targets: graphics,
        alpha: 0.5,
        duration: 800,
        yoyo: true,
        repeat: -1
      });
    });
  }

  createPlayer() {
    // 程序化生成玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(12, 12, 4); // 左眼
    graphics.fillCircle(20, 12, 4); // 右眼
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.arc(16, 16, 8, 0.2, Math.PI - 0.2); // 笑脸
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(200, 200, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(800, 800); // 添加拖拽效果使移动更平滑
    this.player.setMaxVelocity(300, 300);
  }

  setupMainCamera(worldWidth, worldHeight) {
    const mainCamera = this.cameras.main;
    mainCamera.setBounds(0, 0, worldWidth, worldHeight);
    mainCamera.startFollow(this.player, true, 0.1, 0.1); // 平滑跟随
    mainCamera.setZoom(1);
  }

  createMinimap(worldWidth, worldHeight) {
    // 计算小地图尺寸和位置
    const minimapWidth = 200;
    const minimapHeight = 150;
    const padding = 10;
    const x = this.cameras.main.width - minimapWidth - padding;
    const y = padding;

    // 创建小地图相机
    this.miniCam = this.cameras.add(x, y, minimapWidth, minimapHeight);
    this.miniCam.setZoom(Math.min(minimapWidth / worldWidth, minimapHeight / worldHeight));
    this.miniCam.setBounds(0, 0, worldWidth, worldHeight);
    this.miniCam.setBackgroundColor(0x000000);
    
    // 小地图显示全局视图（不跟随）
    this.miniCam.scrollX = (worldWidth - minimapWidth / this.miniCam.zoom) / 2;
    this.miniCam.scrollY = (worldHeight - minimapHeight / this.miniCam.zoom) / 2;

    // 绘制小地图边框（使用固定相机）
    const border = this.add.graphics();
    border.lineStyle(3, 0xffffff, 1);
    border.strokeRect(x - 2, y - 2, minimapWidth + 4, minimapHeight + 4);
    border.fillStyle(0x000000, 0.5);
    border.fillRect(x - 2, y - 2, minimapWidth + 4, minimapHeight + 4);
    border.setScrollFactor(0); // 固定在屏幕上
    border.setDepth(1000);

    // 在小地图上绘制玩家指示器
    this.createPlayerIndicator();
  }

  createPlayerIndicator() {
    // 创建小地图上的玩家指示器
    const indicator = this.add.graphics();
    indicator.fillStyle(0xff0000, 1);
    indicator.fillCircle(0, 0, 8);
    indicator.lineStyle(2, 0xffffff, 1);
    indicator.strokeCircle(0, 0, 8);
    indicator.setDepth(1001);
    
    this.playerIndicator = indicator;
  }

  createDebugText() {
    // 创建调试信息文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.debugText.setScrollFactor(0);
    this.debugText.setDepth(1000);
  }

  update(time, delta) {
    if (!this.player || !this.cursors) return;

    // 玩家移动控制
    const speed = 300;
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown) {
      velocityX = -speed;
    } else if (this.cursors.right.isDown) {
      velocityX = speed;
    }

    if (this.cursors.up.isDown) {
      velocityY = -speed;
    } else if (this.cursors.down.isDown) {
      velocityY = speed;
    }

    // 对角线移动速度归一化
    if (velocityX !== 0 && velocityY !== 0) {
      const factor = Math.sqrt(2) / 2;
      velocityX *= factor;
      velocityY *= factor;
    }

    this.player.setVelocity(velocityX, velocityY);

    // 计算移动距离
    const dx = this.player.x - this.lastPosition.x;
    const dy = this.player.y - this.lastPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    this.totalDistance += distance;
    this.lastPosition = { x: this.player.x, y: this.player.y };

    // 更新玩家指示器位置
    if (this.playerIndicator) {
      this.playerIndicator.x = this.player.x;
      this.playerIndicator.y = this.player.y;
    }

    // 更新调试信息
    this.debugText.setText([
      `Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Distance: ${Math.round(this.totalDistance)}`,
      `Velocity: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`,
      `Use Arrow Keys to Move`
    ]);
  }
}

// 游戏配置
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

// 启动游戏
new Phaser.Game(config);
// 完整的 Phaser3 小地图实现
class MinimapScene extends Phaser.Scene {
  constructor() {
    super('MinimapScene');
    this.player = null;
    this.cursors = null;
    this.mainCamera = null;
    this.minimap = null;
    this.worldWidth = 1600;
    this.worldHeight = 1200;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      playerPosition: { x: 0, y: 0 },
      isMoving: false,
      cameraPosition: { x: 0, y: 0 },
      minimapActive: true,
      timestamp: 0
    };

    // 1. 创建世界背景和网格
    this.createWorld();

    // 2. 创建玩家纹理和精灵
    this.createPlayer();

    // 3. 设置主相机
    this.setupMainCamera();

    // 4. 创建小地图相机
    this.setupMinimap();

    // 5. 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 6. 添加一些可见的地标物体
    this.createLandmarks();

    // 输出初始状态
    console.log('[INIT] Game initialized with minimap');
    this.logState();
  }

  createWorld() {
    // 创建世界边界背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2d2d2d, 1);
    bg.fillRect(0, 0, this.worldWidth, this.worldHeight);

    // 绘制网格
    const gridSize = 100;
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x404040, 0.5);

    for (let x = 0; x <= this.worldWidth; x += gridSize) {
      grid.lineBetween(x, 0, x, this.worldHeight);
    }
    for (let y = 0; y <= this.worldHeight; y += gridSize) {
      grid.lineBetween(0, y, this.worldWidth, y);
    }

    // 绘制世界边界
    const border = this.add.graphics();
    border.lineStyle(4, 0xffff00, 1);
    border.strokeRect(2, 2, this.worldWidth - 4, this.worldHeight - 4);

    // 设置世界边界
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
  }

  createPlayer() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.lineStyle(2, 0xffffff, 1);
    playerGraphics.strokeCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建玩家精灵（在世界中心）
    this.player = this.physics.add.sprite(
      this.worldWidth / 2,
      this.worldHeight / 2,
      'player'
    );

    // 设置玩家物理属性
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);
    this.player.setMaxVelocity(120, 120);
  }

  setupMainCamera() {
    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 设置相机边界为世界大小
    this.mainCamera.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // 设置相机跟随玩家
    this.mainCamera.startFollow(this.player, true, 0.1, 0.1);

    // 设置相机视口大小
    this.mainCamera.setZoom(1);
  }

  setupMinimap() {
    // 创建小地图相机
    const minimapWidth = 200;
    const minimapHeight = 150;
    const padding = 10;

    this.minimap = this.cameras.add(
      this.cameras.main.width - minimapWidth - padding,
      padding,
      minimapWidth,
      minimapHeight
    );

    // 设置小地图相机属性
    this.minimap.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.minimap.setZoom(0.125); // 缩小到 1/8
    this.minimap.centerOn(this.worldWidth / 2, this.worldHeight / 2);

    // 添加小地图背景和边框（在主相机中渲染）
    const minimapBg = this.add.graphics();
    minimapBg.setScrollFactor(0); // 固定在屏幕上
    minimapBg.fillStyle(0x000000, 0.7);
    minimapBg.fillRect(
      this.cameras.main.width - minimapWidth - padding,
      padding,
      minimapWidth,
      minimapHeight
    );

    const minimapBorder = this.add.graphics();
    minimapBorder.setScrollFactor(0);
    minimapBorder.lineStyle(3, 0xffffff, 1);
    minimapBorder.strokeRect(
      this.cameras.main.width - minimapWidth - padding,
      padding,
      minimapWidth,
      minimapHeight
    );

    // 忽略小地图装饰物
    this.minimap.ignore([minimapBg, minimapBorder]);

    // 添加标题
    const title = this.add.text(
      this.cameras.main.width - minimapWidth - padding + 5,
      padding + 5,
      'MINIMAP',
      {
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    title.setScrollFactor(0);
    this.minimap.ignore(title);
  }

  createLandmarks() {
    // 创建一些地标方便观察
    const landmarks = [
      { x: 200, y: 200, color: 0xff0000, size: 40 },
      { x: 1400, y: 200, color: 0x0000ff, size: 40 },
      { x: 200, y: 1000, color: 0xff00ff, size: 40 },
      { x: 1400, y: 1000, color: 0x00ffff, size: 40 },
      { x: 800, y: 600, color: 0xffff00, size: 60 }
    ];

    landmarks.forEach(landmark => {
      const graphics = this.add.graphics();
      graphics.fillStyle(landmark.color, 1);
      graphics.fillRect(
        landmark.x - landmark.size / 2,
        landmark.y - landmark.size / 2,
        landmark.size,
        landmark.size
      );
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeRect(
        landmark.x - landmark.size / 2,
        landmark.y - landmark.size / 2,
        landmark.size,
        landmark.size
      );
    });
  }

  update(time, delta) {
    if (!this.player || !this.cursors) return;

    // 重置加速度
    this.player.setAcceleration(0);

    let isMoving = false;

    // 键盘控制（速度 120）
    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-600);
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(600);
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      this.player.setAccelerationY(-600);
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      this.player.setAccelerationY(600);
      isMoving = true;
    }

    // 更新小地图中心（可选：让小地图也跟随玩家）
    // this.minimap.centerOn(this.player.x, this.player.y);

    // 更新信号
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
    window.__signals__.isMoving = isMoving;
    window.__signals__.cameraPosition = {
      x: Math.round(this.mainCamera.scrollX),
      y: Math.round(this.mainCamera.scrollY)
    };
    window.__signals__.timestamp = time;

    // 每秒记录一次状态
    if (time % 1000 < delta) {
      this.logState();
    }
  }

  logState() {
    const state = {
      time: window.__signals__.timestamp,
      player: window.__signals__.playerPosition,
      camera: window.__signals__.cameraPosition,
      moving: window.__signals__.isMoving,
      minimapActive: window.__signals__.minimapActive
    };
    console.log('[STATE]', JSON.stringify(state));
  }
}

// Phaser 游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);

// 输出游戏信息
console.log('[GAME] Minimap demo started');
console.log('[INFO] Use arrow keys to move the player');
console.log('[INFO] Main camera follows player at speed 120');
console.log('[INFO] Minimap shows full world view in top-right corner');
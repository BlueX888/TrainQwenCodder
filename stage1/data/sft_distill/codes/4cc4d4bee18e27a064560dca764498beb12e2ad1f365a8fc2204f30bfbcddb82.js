// 完整的 Phaser3 小地图实现
class MiniMapScene extends Phaser.Scene {
  constructor() {
    super('MiniMapScene');
    this.worldWidth = 2000;
    this.worldHeight = 1500;
    this.playerSpeed = 120;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化状态信号
    window.__signals__ = {
      playerX: 0,
      playerY: 0,
      mainCameraX: 0,
      mainCameraY: 0,
      miniMapActive: true,
      frameCount: 0
    };

    // 1. 创建大地图背景（使用网格）
    this.createWorldBackground();

    // 2. 创建一些地标作为参考点
    this.createLandmarks();

    // 3. 创建玩家
    this.createPlayer();

    // 4. 设置主相机跟随玩家
    this.setupMainCamera();

    // 5. 创建小地图相机
    this.setupMiniMapCamera();

    // 6. 创建小地图边框和背景
    this.createMiniMapFrame();

    // 7. 设置键盘控制
    this.setupControls();

    // 8. 创建小地图上的玩家指示器
    this.createMiniMapPlayerIndicator();

    // 添加说明文本
    this.createInstructions();
  }

  createWorldBackground() {
    const graphics = this.add.graphics();
    
    // 绘制背景
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, this.worldWidth, this.worldHeight);

    // 绘制网格
    graphics.lineStyle(1, 0x16213e, 0.5);
    const gridSize = 100;
    
    // 垂直线
    for (let x = 0; x <= this.worldWidth; x += gridSize) {
      graphics.lineBetween(x, 0, x, this.worldHeight);
    }
    
    // 水平线
    for (let y = 0; y <= this.worldHeight; y += gridSize) {
      graphics.lineBetween(0, y, this.worldWidth, y);
    }

    // 绘制世界边界
    graphics.lineStyle(4, 0x0f3460, 1);
    graphics.strokeRect(0, 0, this.worldWidth, this.worldHeight);
  }

  createLandmarks() {
    // 创建一些地标（不同颜色的矩形和圆形）
    const landmarks = [
      { x: 300, y: 300, type: 'rect', color: 0xff6b6b, size: 80 },
      { x: 1500, y: 400, type: 'circle', color: 0x4ecdc4, size: 60 },
      { x: 800, y: 1000, type: 'rect', color: 0xffe66d, size: 100 },
      { x: 1700, y: 1200, type: 'circle', color: 0x95e1d3, size: 70 },
      { x: 500, y: 800, type: 'rect', color: 0xf38181, size: 60 },
      { x: 1200, y: 200, type: 'circle', color: 0xaa96da, size: 50 }
    ];

    landmarks.forEach(landmark => {
      const graphics = this.add.graphics();
      graphics.fillStyle(landmark.color, 1);
      
      if (landmark.type === 'rect') {
        graphics.fillRect(
          landmark.x - landmark.size / 2,
          landmark.y - landmark.size / 2,
          landmark.size,
          landmark.size
        );
      } else {
        graphics.fillCircle(landmark.x, landmark.y, landmark.size / 2);
      }
    });
  }

  createPlayer() {
    // 启用物理系统
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.lineStyle(3, 0xffffff, 1);
    graphics.strokeCircle(16, 16, 16);
    graphics.generateTexture('playerTex', 32, 32);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(
      this.worldWidth / 2,
      this.worldHeight / 2,
      'playerTex'
    );
    
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.7);
  }

  setupMainCamera() {
    // 主相机设置
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

    // 设置小地图相机范围
    this.miniMapCamera.setBounds(0, 0, this.worldWidth, this.worldHeight);
    
    // 计算缩放比例以显示整个世界
    const zoomX = miniMapWidth / this.worldWidth;
    const zoomY = miniMapHeight / this.worldHeight;
    const zoom = Math.min(zoomX, zoomY);
    
    this.miniMapCamera.setZoom(zoom);
    
    // 让小地图显示整个世界的中心
    this.miniMapCamera.centerOn(this.worldWidth / 2, this.worldHeight / 2);
    
    // 设置背景色
    this.miniMapCamera.setBackgroundColor(0x000000);
  }

  createMiniMapFrame() {
    // 创建小地图边框（固定在屏幕上）
    const miniMapWidth = 200;
    const miniMapHeight = 150;
    const padding = 10;

    const frameGraphics = this.add.graphics();
    frameGraphics.setScrollFactor(0); // 固定在屏幕上
    frameGraphics.setDepth(1000);

    // 半透明背景
    frameGraphics.fillStyle(0x000000, 0.5);
    frameGraphics.fillRect(
      this.cameras.main.width - miniMapWidth - padding,
      padding,
      miniMapWidth,
      miniMapHeight
    );

    // 边框
    frameGraphics.lineStyle(3, 0xffffff, 1);
    frameGraphics.strokeRect(
      this.cameras.main.width - miniMapWidth - padding,
      padding,
      miniMapWidth,
      miniMapHeight
    );

    // 标题
    const title = this.add.text(
      this.cameras.main.width - miniMapWidth / 2 - padding,
      padding + 5,
      'MINI MAP',
      {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    title.setOrigin(0.5, 0);
    title.setScrollFactor(0);
    title.setDepth(1001);
  }

  createMiniMapPlayerIndicator() {
    // 在小地图上创建玩家位置指示器
    const indicatorGraphics = this.add.graphics();
    indicatorGraphics.fillStyle(0xff0000, 1);
    indicatorGraphics.fillCircle(0, 0, 5);
    indicatorGraphics.lineStyle(2, 0xffffff, 1);
    indicatorGraphics.strokeCircle(0, 0, 5);
    
    this.miniMapIndicator = indicatorGraphics;
    this.miniMapIndicator.setDepth(1002);
  }

  setupControls() {
    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加 WASD 键
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  createInstructions() {
    const instructions = this.add.text(
      10,
      10,
      'Use Arrow Keys or WASD to move\nSpeed: 120 px/s',
      {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
    instructions.setScrollFactor(0);
    instructions.setDepth(1000);
  }

  update(time, delta) {
    // 更新帧计数
    window.__signals__.frameCount++;

    // 处理玩家移动
    const velocity = new Phaser.Math.Vector2(0, 0);

    if (this.cursors.left.isDown || this.keys.a.isDown) {
      velocity.x = -1;
    } else if (this.cursors.right.isDown || this.keys.d.isDown) {
      velocity.x = 1;
    }

    if (this.cursors.up.isDown || this.keys.w.isDown) {
      velocity.y = -1;
    } else if (this.cursors.down.isDown || this.keys.s.isDown) {
      velocity.y = 1;
    }

    // 归一化速度向量并应用速度
    if (velocity.length() > 0) {
      velocity.normalize();
      this.player.setVelocity(
        velocity.x * this.playerSpeed,
        velocity.y * this.playerSpeed
      );
    } else {
      this.player.setVelocity(0, 0);
    }

    // 更新小地图上的玩家指示器位置
    this.miniMapIndicator.setPosition(this.player.x, this.player.y);

    // 更新状态信号
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.mainCameraX = Math.round(this.cameras.main.scrollX);
    window.__signals__.mainCameraY = Math.round(this.cameras.main.scrollY);

    // 每 60 帧输出一次日志
    if (window.__signals__.frameCount % 60 === 0) {
      console.log(JSON.stringify({
        timestamp: Date.now(),
        player: {
          x: window.__signals__.playerX,
          y: window.__signals__.playerY
        },
        mainCamera: {
          x: window.__signals__.mainCameraX,
          y: window.__signals__.mainCameraY
        },
        frame: window.__signals__.frameCount
      }));
    }
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
  scene: MiniMapScene
};

// 启动游戏
const game = new Phaser.Game(config);
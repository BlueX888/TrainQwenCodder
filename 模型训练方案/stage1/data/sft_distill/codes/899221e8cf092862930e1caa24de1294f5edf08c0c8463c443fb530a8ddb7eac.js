class MiniMapScene extends Phaser.Scene {
  constructor() {
    super('MiniMapScene');
    this.playerSpeed = 80;
    this.worldWidth = 1600;
    this.worldHeight = 1200;
    this.miniMapWidth = 200;
    this.miniMapHeight = 150;
    // 状态信号
    this.playerX = 0;
    this.playerY = 0;
    this.cameraX = 0;
    this.cameraY = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置世界边界
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // 创建地图背景
    this.createWorldBackground();

    // 创建玩家纹理和精灵
    this.createPlayerTexture();
    this.player = this.physics.add.sprite(
      this.worldWidth / 2,
      this.worldHeight / 2,
      'playerTex'
    );
    this.player.setCollideWorldBounds(true);

    // 创建一些地图元素（障碍物/装饰）
    this.createMapElements();

    // 设置主相机
    this.setupMainCamera();

    // 创建小地图相机
    this.setupMiniMapCamera();

    // 创建小地图装饰
    this.createMiniMapDecorations();

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.debugText.setScrollFactor(0);
    this.debugText.setDepth(1000);
  }

  createWorldBackground() {
    const graphics = this.add.graphics();
    
    // 绘制棋盘格背景
    const tileSize = 100;
    for (let y = 0; y < this.worldHeight; y += tileSize) {
      for (let x = 0; x < this.worldWidth; x += tileSize) {
        const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
        graphics.fillStyle(isEven ? 0x2a2a2a : 0x1a1a1a, 1);
        graphics.fillRect(x, y, tileSize, tileSize);
      }
    }

    // 绘制世界边界
    graphics.lineStyle(4, 0xff0000, 1);
    graphics.strokeRect(2, 2, this.worldWidth - 4, this.worldHeight - 4);
  }

  createPlayerTexture() {
    const graphics = this.add.graphics();
    
    // 绘制玩家（三角形箭头）
    graphics.fillStyle(0x00ff00, 1);
    graphics.beginPath();
    graphics.moveTo(0, -16);
    graphics.lineTo(-12, 16);
    graphics.lineTo(12, 16);
    graphics.closePath();
    graphics.fillPath();

    // 添加边框
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokePath();

    // 生成纹理
    graphics.generateTexture('playerTex', 32, 32);
    graphics.destroy();
  }

  createMapElements() {
    const graphics = this.add.graphics();
    
    // 使用固定种子创建一些装饰元素
    const seed = 12345;
    const random = this.createSeededRandom(seed);
    
    // 创建一些圆形障碍物
    for (let i = 0; i < 15; i++) {
      const x = random() * (this.worldWidth - 200) + 100;
      const y = random() * (this.worldHeight - 200) + 100;
      const radius = 20 + random() * 30;
      
      graphics.fillStyle(0x4444ff, 0.6);
      graphics.fillCircle(x, y, radius);
      graphics.lineStyle(2, 0x6666ff, 1);
      graphics.strokeCircle(x, y, radius);
    }

    // 创建一些矩形区域
    for (let i = 0; i < 10; i++) {
      const x = random() * (this.worldWidth - 300) + 100;
      const y = random() * (this.worldHeight - 300) + 100;
      const w = 50 + random() * 100;
      const h = 50 + random() * 100;
      
      graphics.fillStyle(0xff4444, 0.4);
      graphics.fillRect(x, y, w, h);
      graphics.lineStyle(2, 0xff6666, 1);
      graphics.strokeRect(x, y, w, h);
    }
  }

  setupMainCamera() {
    const mainCamera = this.cameras.main;
    mainCamera.setBounds(0, 0, this.worldWidth, this.worldHeight);
    mainCamera.startFollow(this.player, true, 0.1, 0.1);
    mainCamera.setZoom(1);
  }

  setupMiniMapCamera() {
    // 创建小地图相机
    const miniMapX = this.cameras.main.width - this.miniMapWidth - 10;
    const miniMapY = 10;
    
    this.miniMapCamera = this.cameras.add(
      miniMapX,
      miniMapY,
      this.miniMapWidth,
      this.miniMapHeight
    );

    // 设置小地图相机显示整个世界
    this.miniMapCamera.setBounds(0, 0, this.worldWidth, this.worldHeight);
    
    // 计算缩放比例以显示整个世界
    const zoomX = this.miniMapWidth / this.worldWidth;
    const zoomY = this.miniMapHeight / this.worldHeight;
    const zoom = Math.min(zoomX, zoomY);
    this.miniMapCamera.setZoom(zoom);

    // 设置相机背景色
    this.miniMapCamera.setBackgroundColor(0x000000);

    // 小地图相机不跟随，显示全局视角
    this.miniMapCamera.scrollX = this.worldWidth / 2 - this.miniMapWidth / (2 * zoom);
    this.miniMapCamera.scrollY = this.worldHeight / 2 - this.miniMapHeight / (2 * zoom);
  }

  createMiniMapDecorations() {
    // 创建小地图边框（固定在屏幕上）
    const miniMapX = this.cameras.main.width - this.miniMapWidth - 10;
    const miniMapY = 10;

    const border = this.add.graphics();
    border.lineStyle(3, 0xffffff, 1);
    border.strokeRect(miniMapX - 2, miniMapY - 2, this.miniMapWidth + 4, this.miniMapHeight + 4);
    border.setScrollFactor(0);
    border.setDepth(999);

    // 创建小地图标题
    const title = this.add.text(miniMapX, miniMapY - 20, 'MINI MAP', {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setScrollFactor(0);
    title.setDepth(999);

    // 在小地图中创建玩家指示器（红点）
    this.miniMapPlayerIndicator = this.add.graphics();
    this.miniMapPlayerIndicator.setDepth(1001);
  }

  createSeededRandom(seed) {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }

  update(time, delta) {
    // 更新玩家移动
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
      this.player.setAngle(-90);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
      this.player.setAngle(90);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
      this.player.setAngle(0);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
      this.player.setAngle(180);
    }

    // 对角线移动时规范化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }

    // 更新小地图上的玩家指示器
    this.updateMiniMapIndicator();

    // 更新状态信号
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);
    this.cameraX = Math.round(this.cameras.main.scrollX);
    this.cameraY = Math.round(this.cameras.main.scrollY);

    // 更新调试信息
    this.debugText.setText([
      `Player: (${this.playerX}, ${this.playerY})`,
      `Camera: (${this.cameraX}, ${this.cameraY})`,
      `Speed: ${this.playerSpeed}`,
      'Arrow Keys: Move'
    ]);
  }

  updateMiniMapIndicator() {
    this.miniMapPlayerIndicator.clear();
    
    // 在小地图上绘制玩家位置（红色圆点）
    this.miniMapPlayerIndicator.fillStyle(0xff0000, 1);
    this.miniMapPlayerIndicator.fillCircle(this.player.x, this.player.y, 15);
    
    // 添加白色边框
    this.miniMapPlayerIndicator.lineStyle(3, 0xffffff, 1);
    this.miniMapPlayerIndicator.strokeCircle(this.player.x, this.player.y, 15);

    // 绘制玩家方向指示
    const angle = this.player.angle * Math.PI / 180;
    const length = 25;
    const endX = this.player.x + Math.sin(angle) * length;
    const endY = this.player.y - Math.cos(angle) * length;
    
    this.miniMapPlayerIndicator.lineStyle(4, 0xffff00, 1);
    this.miniMapPlayerIndicator.lineBetween(this.player.x, this.player.y, endX, endY);
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